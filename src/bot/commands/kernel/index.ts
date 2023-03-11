import {VK} from "vk-io";
import {BugHunterCommand} from "./BugHunterCommand.js";
import {BugReportMsgShowCommand} from "./BugReportMsgShow.js";
import {StartCommand} from "./StartCommand.js";
import {ListCommand} from "./ListCommand.js";

export function InitKernelCommands(vk: Omit<VK, "updates">) {
    new BugHunterCommand(vk);
    new BugReportMsgShowCommand(vk);
    new StartCommand(vk);
    new ListCommand(vk);
}