import {PayloadType} from "./PayloadType.js";
import {UnitedAttachment} from "./UnitedAttachment.js";

export interface ContextVar {
    words: string[];
    comment: string;
    attachments?: UnitedAttachment[];
    payload?: Omit<PayloadType, "command">;
    username: string;
}