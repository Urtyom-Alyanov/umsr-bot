import {ResponseMessage} from "./ResponseMessage.js";
import {SystemVar} from "./SystemVar.js";
import {ContextVar} from "./ContextVar.js";
import {CommandList} from "../bot/kernel/CommandList.js";
import {VK} from "vk-io";

export interface ICommand {
    showInList: boolean;
    accessLevel: number;
    socialRating: number;
    description: string;

    get keys(): { messages?: string[], payload?: string[] };

    process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage>;
}

export class Command implements ICommand {
    public async process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage> {
        return {
            message: "🔔 | Данная команда ничего не возвращает"
        }
    };

    protected messageKeys: string[] = [];
    protected payloadKeys: string[] = [];
    public description: string = "Это стандартное описание команд, у которых не задано описание";

    get keys() {
        return { messages: this.messageKeys, payload: this.payloadKeys };
    }

    public showInList: boolean = true;
    public accessLevel: number = 0;
    public socialRating: number = 60;

    constructor(protected readonly vk: Omit<VK, "updates">) {
        CommandList.push(this);
    }
}