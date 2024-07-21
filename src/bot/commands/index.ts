import {InitKernelCommands} from "./kernel/index.js";
import {VK} from "vk-io";
import {InitAICommands} from "./ai/index.js";
import { InitPassportCommands } from "./passport/index.js";

export function InitCommands(vk: Omit<VK, "updates">) {
    InitKernelCommands(vk);
    InitAICommands(vk);
    InitPassportCommands(vk);
}