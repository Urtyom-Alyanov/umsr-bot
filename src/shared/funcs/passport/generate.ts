import sharp from "sharp";
import { TEMPLATE_SETTINGS, getInputSettings } from "./settingsForTemplate.js";
import { randomInteger } from "../randomInteger.js";
import path from "path";
import { getDirname } from "../dirname.js";

const transformTextToBuffer = (text: string, width: number, height?: number, fontSize?: number, upperCase = false) => {
    const svgImage = `
        <svg width="${width}" height="${height || 30}">
            <style>
                .text {
                    font-family: "Century Gothic", sans-serif;
                    font-size: ${fontSize || 42}px;
                    fill: #000000;
                    font-weight: bold;
                }
            </style>
          <text x="50%" textLength="90%" y="63.75%" text-anchor="middle" dominant-baseline="middle" class="text">
            <tspan textLength="90%" lengthAdjust="spacingAndGlyphs">${text}</tspan>
          </text>
        </svg>
    `;

    return Buffer.from(svgImage);
}

async function cropPhoto(buf: Buffer, gs = false): Promise<sharp.OverlayOptions>  {
    const stampImg = sharp(buf);
    stampImg.resize({ height: TEMPLATE_SETTINGS.photo.height, width: TEMPLATE_SETTINGS.photo.width, background: "#00000000" })
    stampImg.greyscale(gs);
    if (!gs) stampImg.composite([{
        input: Buffer.from([0,0,0,192]),
        raw: {
            width: 1,
            height: 1,
            channels: 4,
        },
        tile: true,
        blend: 'dest-in',
    }])
    return { 
            input: await stampImg.toBuffer(), 
            top: TEMPLATE_SETTINGS.photo.position.y,
            left: TEMPLATE_SETTINGS.photo.position.x,
            gravity: "northeast",
            // blend: "dest-in"
        };
};

async function setStamp<StampType extends string = string>(stamp: StampType): Promise<sharp.OverlayOptions> {
    const input = path.join(getDirname(), "passport", "template", "stamps", `${stamp}.svg`);
    const stampImg = sharp(input, { density: 450 });
    const { height, width } = await stampImg.metadata();
    if (!height || !width) return {};
    if (height > width) stampImg.resize({ height: 290 })
    if (height <= width) stampImg.resize({ width: 290 })
    stampImg.rotate(randomInteger(-45, 45), { background: "#00000000" }).blur(1);
    return { 
            input: await stampImg.toBuffer(), 
            top: randomInteger(TEMPLATE_SETTINGS.stampPlace.positionStart.y, TEMPLATE_SETTINGS.stampPlace.positionEnd.y - 330),
            left: randomInteger(TEMPLATE_SETTINGS.stampPlace.positionStart.x, TEMPLATE_SETTINGS.stampPlace.positionEnd.x - 330),
            gravity: sharp.gravity.northeast
        };
};

async function setInput<KeyType extends string = string>(input: KeyType, value: string): Promise<sharp.OverlayOptions>  {
    // @ts-ignore
    const settings = getInputSettings(input);
    if (!settings) return {};
    
    const { position: { x: left, y: top }, width, height, text: { fontSize, upperCase } } = settings;
    return { input: transformTextToBuffer(upperCase ? value.toUpperCase() : value, width, height, fontSize), top: Math.ceil(top || 0) - height, left: Math.floor(left || 0), gravity: sharp.gravity.southeast }
}

export async function generatePassport<KeysType extends string = string, StampType extends string = string>(values: Record<KeysType, string>, imgBuffer: Buffer, stamps: StampType[]) {
    const input = path.join(getDirname(), "passport", "template", "template.png");
    const template = sharp(input);

    template.composite([
        ...(await Promise.all(stamps.map((s) => setStamp(s)))).filter(s => !!s),
        ...(await Promise.all(Object.entries<string>(values).map(([i, v]) => setInput(i, v)))).filter(s => !!s),
        (await cropPhoto(imgBuffer, true)),
        (await cropPhoto(imgBuffer))
    ]);

    return template.toBuffer();
};