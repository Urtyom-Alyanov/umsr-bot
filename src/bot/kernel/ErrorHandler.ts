import {ResponseMessage} from "../../shared/types/ResponseMessage.js";
import {Attachment, ButtonColor, Keyboard} from "vk-io";
import {BotConfig} from "../cfg.js";

export function ErrorHandler(e: Error): ResponseMessage {
    let message = BotConfig.KernelTexts.BugDetected;
    console.log(e)
    let attachments: Attachment[] = [];
    let keyboard = Keyboard.builder().inline(true).callbackButton({ color:ButtonColor.POSITIVE, label: "❌ | Сообщить об ошибке", payload: {command: 'bug_report'} });
    return {message, attachments, keyboard}
}