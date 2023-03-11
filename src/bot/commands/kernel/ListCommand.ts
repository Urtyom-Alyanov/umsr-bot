import {Command} from "../../../types/Command.js";
import {SystemVar} from "../../../types/SystemVar.js";
import {ContextVar} from "../../../types/ContextVar.js";
import {ResponseMessage} from "../../../types/ResponseMessage.js";
import {CommandList} from "../../kernel/CommandList.js";

export class ListCommand extends Command {
    messageKeys = ["команды", "помощь", "список"];
    payloadKeys = ["commands", "list", "help"];

    description = "Вывод списка команд, доступных к использованию";

    async process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage> {
        return {
            message: `📜 | Список команд бота Floco:\n\n` + CommandList.filter(c => c.showInList).map((c) => {
                return `· ${c.description} / Доступно с рейтинга ${c.socialRating} с уровнем доступа ${c.accessLevel} / Вызов: ${c.keys.messages.join(", ")}\n`
            }) + `\n Учтите, что не все команды в этом списке есть.`
        }
    }
}