import { ResponseMessage } from "shared/types/ResponseMessage.js";
import {MsgHandler} from "../../shared/types/MsgHandler.js";
import {PayloadType} from "../../shared/types/PayloadType.js";
import {Keyboard, KeyboardBuilder} from "vk-io";

export interface CommentState {
    payload: PayloadType;
    addPayloadProp: string;
}

export class CommentHandler extends MsgHandler<CommentState> {
    getName(): string {
        return "comment";
    }

    protected async process(): Promise<ResponseMessage> {
        const state = await this.getState();
        if (!state.addPayloadProp) state.addPayloadProp = "comment";
        // @ts-ignore
        state.payload[state.addPayloadProp] = this.message;
        await this.handlerReroute("commands")
        return {
            message: "📖 | Комментарий написан!",
            keyboard: new KeyboardBuilder().inline().callbackButton({ payload: state.payload, label: "Выполнить действие" })
        }
    }

}