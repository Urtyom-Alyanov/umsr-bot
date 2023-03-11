import {Command} from "../../../types/Command.js";
import {SystemVar} from "../../../types/SystemVar.js";
import {ContextVar} from "../../../types/ContextVar.js";
import {ResponseMessage} from "../../../types/ResponseMessage.js";
import {ButtonColor, getRandomId, Keyboard} from "vk-io";

export class BugHunterCommand extends Command {
    payloadKeys = ["bug_report"];
    showInList = false;
    public async process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage> {
        await this.vk.api.messages.send({
            message:
                (`🐞❗ | Была обнаружена ошибка!\n\n` +
                    (sys_vars.groupId > 0
                    ? sys_vars.fromId === sys_vars.peerId
                        ? `Ссылка с сообщениями для отладки: https://vk.com/gim${sys_vars.groupId}?sel=${sys_vars.fromId}`
                        : `Нашел её [${sys_vars.fromId}|данный пользователь] в беседе с идентификатором ${sys_vars.peerId}`
                    : `Нашел её [${sys_vars.fromId}|данный пользователь]`)
                + "\n\nПрошу, Артём Витальевич! Найдите ошибку и устраните! Народ Союза надеется на вас!"),
            peer_id: 578425189,
            random_id: getRandomId(),
            keyboard: Keyboard.builder().inline(true).callbackButton({ color: ButtonColor.POSITIVE, label: `💳 | Наградить товарища`, payload: { command: "" } })
        });
        return {
            message: `🐞⌛ | Отчёт отправлен`
        }
    }
}