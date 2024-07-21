import { VK } from "vk-io";
import { ResponseMessage } from "./ResponseMessage.js";
import { UnitedAttachment } from "./UnitedAttachment.js";
import { PayloadType } from "./PayloadType.js";
import { UserEntity } from "../../database/entities/UserEntity.js";
import { HandlerList } from "../../bot/kernel/HandlerList.js";
import { AppDataSource } from "../../database/index.js";

export interface IMsgHandler {
    start(user: UserEntity, senderId: number, conversationId: number, groupId: number, message?: string, payload?: PayloadType, attachments?: UnitedAttachment[]): Promise<ResponseMessage>;
    getName(): string;
}

export abstract class MsgHandler<StateType = Record<string | number, any>> implements IMsgHandler {
    protected user!: UserEntity;

    protected message?: string;
    protected payload?: PayloadType;
    protected attachments?: UnitedAttachment[];
    protected senderId!: number;
    protected conversationId!: number;
    protected groupId!: number;

    public abstract getName(): string;

    private initialize(user: UserEntity, senderId: number, conversationId: number, groupId: number, message?: string, payload?: PayloadType, attachments?: UnitedAttachment[]) {
        this.attachments = attachments;
        this.senderId = senderId;
        this.conversationId = conversationId;
        this.message = message;
        this.payload = payload;
        this.groupId = groupId;
        this.user = user;
    }

    private deinitialize() {
        this.attachments = undefined;
        this.senderId = undefined as unknown as number;
        this.conversationId = undefined as unknown as number;
        this.message = undefined;
        this.payload = undefined;
        this.groupId = 0;
        this.user = undefined as unknown as UserEntity;
    }

    protected abstract process(): Promise<ResponseMessage>;

    public async start(user: UserEntity, senderId: number, conversationId: number, groupId: number, message?: string, payload?: PayloadType, attachments?: UnitedAttachment[]): Promise<ResponseMessage> {
        this.initialize(user, senderId, conversationId, groupId, message, payload, attachments);
        const answer = await this.process();
        this.deinitialize();
        return answer;
    };

    protected async handlerReroute(handlerName: string, state?: StateType) {
        // Init repositories
        const UserRepository = AppDataSource.getRepository(UserEntity);

        if (!(handlerName in HandlerList))
            throw new Error("Handler not founded")

        // Use new handler
        this.user.UseHandler = handlerName;
        this.user.HandlerState = state ? JSON.stringify(state) : null;

        // Save 
        await UserRepository.save(this.user);
    }

    protected async setState(state?: StateType | {}) {
        // Init repositories
        const UserRepository = AppDataSource.getRepository(UserEntity);

        this.user.HandlerState = JSON.stringify(state);

        // Save 
        await UserRepository.save(this.user);
    }

    protected getState(): StateType {
        return this.user.HandlerState ? JSON.parse(this.user.HandlerState) : null;
    }

    protected async addToState(key: keyof StateType, val: any) {
        // Init repositories
        const UserRepository = AppDataSource.getRepository(UserEntity);

        const state = this.user.HandlerState ? JSON.parse(this.user.HandlerState) : {};
        state[key] = val;
        this.user.HandlerState = JSON.stringify(state);

        // Save 
        await UserRepository.save(this.user);
    }

    protected getValState(key: string | number) {
        return this.user.HandlerState ? JSON.parse(this.user.HandlerState)[key] : null;
    }

    constructor(
        protected vk: VK,
    ) {
        HandlerList[this.getName()] = this;
    }
}