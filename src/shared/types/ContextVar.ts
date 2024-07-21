import {PayloadType} from "./PayloadType";
import {UnitedAttachment} from "./UnitedAttachment";
import {UserEntity} from "../../database/entities/UserEntity";

export interface ContextVar {
    words: string[];
    comment: string;
    attachments?: UnitedAttachment[];
    payload?: Omit<PayloadType, "command">;
    username: string;
    user: UserEntity;
}