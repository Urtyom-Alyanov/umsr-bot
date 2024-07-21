import { PassportInputKeysEnum } from "shared/types/PassportInputKeysEnum";

export interface PositionSettings {
    x: number;
    y: number;
}

export interface TextSettings {
    fontSize: number;
    upperCase: boolean;
}

export interface PhotoSettings {
    height: number;
    width: number;
    position: PositionSettings;
}

export interface InputSettings {
    width?: number;
    height?: number;
    text?: Partial<TextSettings>;
    position: Partial<PositionSettings>;
}

export interface StampPlaceSettings {
    positionStart: PositionSettings;
    positionEnd: PositionSettings;
}

export interface TemplateSettings<InputKeys extends string = string> {
    photo: PhotoSettings;
    stampPlace: StampPlaceSettings;
    inputPlaces: {
        default: InputSettings;
    } & Record<InputKeys, InputSettings>
}

export const TEMPLATE_SETTINGS: TemplateSettings<PassportInputKeysEnum> = {
    photo: {
        height: 400,
        width: 300,
        position: {
            x: 877,
            y: 1094
        }
    },
    stampPlace: {
        positionStart: {
            x: 846.31,
            y: 321.19,
        },
        positionEnd: {
            x: 1876.67,
            y: 1006.18,
        },
    },
    inputPlaces: {
        default: {
            width: 512.44,
            height: 48,
            position: {
                x: 1332.28
            },
            text: {
                fontSize: 42
            }
        },
        name: {
            position: {
                y: 1139.34
            }
        },
        surname: {
            position: {
                y: 1195.25
            }
        },
        patronymicname: {
            position: {
                y: 1251.16
            }
        },
        nation: {
            position: {
                y: 1479.25
            }
        },
        date: {
            width: 214.48,
            position: {
                y: 1307.34
            }
        },
        gender: {
            width: 174.56,
            position: {
                y: 1307.34,
                x: 1671.22
            }
        },
        placeOfBirthRepublic: {
            position: {
                y: 1365.25
            }
        },
        placeOfBirthCity: {
            position: {
                y: 1422.25
            }
        },
        id: {
            height: 79,
            width: 969,
            position: {
                y: 1535 + 79,
                x: 877
            },
            text: {
                fontSize: 36,
                upperCase: true
            }
        },
        sign: {
            height: 79,
            width: 969,
            position: {
                y: 1631 + 79,
                x: 877
            },
            text: {
                fontSize: 24,
                upperCase: true
            }
        }
    }
};

export function getInputSettings(input: PassportInputKeysEnum): Required<InputSettings> | undefined {
    const inpt_places_set = TEMPLATE_SETTINGS.inputPlaces;
    if (!inpt_places_set[input]) return;
    return {
        width: inpt_places_set[input]?.width || inpt_places_set.default.width || 0,
        height: inpt_places_set[input]?.height || inpt_places_set.default.height || 0,
        text: {
            fontSize: inpt_places_set[input]?.text?.fontSize || inpt_places_set.default.text?.fontSize || 0,
            upperCase: inpt_places_set[input]?.text?.upperCase || inpt_places_set.default.text?.upperCase || false
        },
        position: {
            x: inpt_places_set[input]?.position.x || inpt_places_set.default.position.x || 0,
            y: inpt_places_set[input]?.position.y || inpt_places_set.default.position.y || 0,
        }
    }
}