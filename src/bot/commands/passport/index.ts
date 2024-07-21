import {VK} from "vk-io";
import {ShowPassportCommand} from "./Show.js";
import {MVDPassportCommand} from "./MVD.js";

export function InitPassportCommands(vk: Omit<VK, "updates">) {
    new ShowPassportCommand(vk);
    new MVDPassportCommand(vk);
}