import {VK} from "vk-io";
import {BotConfig} from "./cfg.js";
import {InitCommands} from "./commands/index.js";

const vk = new VK({
    token: BotConfig.Token,
    language: "de"
});

export function InitVKFuncs() {
    InitCommands(vk);
}

export default vk