import {VK} from "vk-io";
import {BugHunterCommand} from "./BugHunterCommand.js";
import {StartCommand} from "./StartCommand.js";
import {ListCommand} from "./ListCommand.js";

export function InitKernelCommands(vk: Omit<VK, "updates">) {
    new BugHunterCommand(vk);
    new StartCommand(vk);
    new ListCommand(vk);
}