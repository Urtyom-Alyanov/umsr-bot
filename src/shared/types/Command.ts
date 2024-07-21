import {ResponseMessage} from "./ResponseMessage.js";
import {SystemVar} from "./SystemVar.js";
import {ContextVar} from "./ContextVar.js";
import {CommandList} from "../../bot/kernel/CommandList.js";
import {VK} from "vk-io";
import { UserEntity } from "../../database/entities/UserEntity.js";
import { HandlerList } from "../../bot/kernel/HandlerList.js";
import { AppDataSource } from "../../database/index.js";

export interface ICommand {
    showInList: boolean;
    accessLevel: number;
    socialRating: number;
    description: string;

    get keys(): { messages?: string[], payload?: string[] };

    process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage>;
}

export abstract class Command implements ICommand {
    public abstract process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage>;

    protected abstract messageKeys: string[];
    protected abstract payloadKeys: string[];
    public description: string = "Это стандартное описание команд, у которых не задано описание";

    get keys() {
        return { messages: this.messageKeys, payload: this.payloadKeys };
    }

    public showInList: boolean = true;
    public accessLevel: number = 0;
    public socialRating: number = 60;

    protected async handlerReroute<StateType = Record<string | number, any>>(user: UserEntity, handlerName: string, state?: StateType) {
        // Init repositories
        const UserRepository = AppDataSource.getRepository(UserEntity);

        if (!(handlerName in HandlerList))
            throw new Error("Handler not founded")

        // Use new handler
        user.UseHandler = handlerName;
        user.HandlerState = JSON.stringify(state);

        // Save 
        await UserRepository.save(user);
    }

    constructor(protected readonly vk: Omit<VK, "updates">) {
        CommandList.push(this);
    }
}