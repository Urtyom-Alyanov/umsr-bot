import {Command} from "../../../shared/types/Command.js";
import {SystemVar} from "../../../shared/types/SystemVar.js";
import {ContextVar} from "../../../shared/types/ContextVar.js";
import {ResponseMessage} from "../../../shared/types/ResponseMessage.js";
import {CommandList} from "../../kernel/CommandList.js";

export class ListCommand extends Command {
    messageKeys = ["команды", "помощь", "список"];
    payloadKeys = ["commands", "list", "help"];

    description = "Вывод списка команд, доступных к использованию";

    async process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage> {
        return {
            message: `📜 | Список команд бота :\n\n` + CommandList.filter(c => c.showInList).map((c) => {
                return `· ${c.description} | Доступно с рейтинга ${c.socialRating} с уровнем доступа ${c.accessLevel} | Вызов: ${c.keys.messages.join(", ")}`
            }).join("\n\n") + `\n\n❗ |  Учтите, что не все команды в этом списке есть.`
        }
    }
}