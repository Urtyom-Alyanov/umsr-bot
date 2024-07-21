import {VK} from "vk-io";
import { CommandMsgHandler } from "./CommandHandler.js";
import { PassportCreatingHandler } from "./PassportCreatingHandler.js";
import {CommentHandler} from "./CommentHandler.js";

export function InitHandlers(vk: VK) {
    new CommandMsgHandler(vk);
    new PassportCreatingHandler(vk);
    new CommentHandler(vk);
}