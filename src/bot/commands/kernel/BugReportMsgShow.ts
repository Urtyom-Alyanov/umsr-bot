import {Command} from "../../../types/Command.js";
import {SystemVar} from "../../../types/SystemVar.js";
import {ContextVar} from "../../../types/ContextVar.js";
import {ResponseMessage} from "../../../types/ResponseMessage.js";

export class BugReportMsgShowCommand extends Command {
    showInList = false
    messageKeys = ["вызвать ошибку"]
    accessLevel = 4
    public async process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage> {
        throw Error("Тест")
    }
}