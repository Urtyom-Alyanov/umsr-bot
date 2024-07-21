import {Keyboard} from "vk-io";
import {UnitedAttachment} from "./UnitedAttachment";

export interface ResponseMessage {
    message?: string;
    attachments?: UnitedAttachment[];
    keyboard?: Keyboard;
}