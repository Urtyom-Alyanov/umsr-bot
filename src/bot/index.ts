import {VK} from "vk-io";
import {BotConfig} from "./cfg.js";
import {InitCommands} from "./commands/index.js";
import {InitHandlers} from "./handlers/index.js";

if (!BotConfig.Token)
    throw Error("VK Token is required");

const vk = new VK({
    token: BotConfig.Token,
    language: "de",
    webhookSecret: BotConfig.VkSecretKey
});

export function InitVKFuncs() {
    InitCommands(vk);
    InitHandlers(vk);
}

export default vk