import {PayloadType} from "../../types/PayloadType.js";
import {UnitedAttachment} from "../../types/UnitedAttachment.js";
import {ResponseMessage} from "../../types/ResponseMessage.js";
import {SystemVar} from "../../types/SystemVar.js";
import {ContextVar} from "../../types/ContextVar.js";
import {Command} from "../../types/Command.js";
import {ErrorHandler} from "./ErrorHandler.js";
import {range} from "../../funcs/range.js";
import {DamerauLevenshteinDistance} from "../../funcs/DamerauLevenshteinDistance.js";
import { CommandList } from "./CommandList.js";
import {BotConfig} from "../cfg.js";
import vk from "../index.js";

export async function GetAnswer(request_message: string, from_id: number, peer_id: number, gId: number, payload?: PayloadType, attachments?: UnitedAttachment[]): Promise<ResponseMessage & { err?: Error }> {
    let _request_message = request_message;

    const SYS_VARS: SystemVar = {
        fromId: from_id,
        peerId: peer_id,
        isPayload: false,
        groupId: gId
    };
    const user = (await vk.api.users.get({ user_ids: [from_id] }))[0];
    let CONTEXT_VARS: ContextVar = {
        words: request_message.split("\n")[0].split(" ") || [],
        comment: request_message.split("\n").slice(1).join("\n") || "",
        attachments,
        payload: (payload || {}),
        username: user.first_name + " " + user.last_name
    }

    let distance = request_message.length;
    let err: Error;
    let command: Command;
    let new_distance = 0;
    let key = '';
    let new_request_message = '';

    const gotAnswer = async (c: Command) => {
        let _message, _attachments, _keyboard
        await vk.api.messages.markAsRead({ peer_id, mark_conversation_as_read: true });
        const timId = setInterval(async () =>
            await vk.api.messages.setActivity({ peer_id: peer_id, type: "typing" }), 5000)
        try {
            let {message, attachments, keyboard} = await c.process(SYS_VARS, CONTEXT_VARS)
            _message = message;
            _attachments = attachments;
            _keyboard = keyboard;
        }
        catch (e) {
            const {message, attachments, keyboard} = ErrorHandler(e as Error)
            _message = message;
            _attachments = attachments;
            _keyboard = keyboard;
            err = e as Error;
        } finally {
            CONTEXT_VARS = {
                words: [],
                comment: "",
                attachments: [],
                payload: { command: "" },
                username: ""
            };
        }
        clearInterval(timId);
        return {message: _message, attachments: _attachments, keyboard: _keyboard, err}
    }

    if (CONTEXT_VARS.words) {
        for (const c of CommandList) {
            if (!payload || !payload.command) {
                for (const k of (c.keys.messages || [])) {
                    const len_k = k.split(" ").length;
                    if (len_k > CONTEXT_VARS.words.length)
                        continue;
                    let dist = 0;
                    for (const kw of range(len_k)) {
                        const a: string = CONTEXT_VARS.words[kw];
                        const b: string = k.split(" ")[kw];
                        const dista = DamerauLevenshteinDistance(a.toLowerCase(), b.toLowerCase())
                        if (dista === 0 || dista < a.length*BotConfig.TypoPercent)
                            dist += 1;
                        else
                            dist = 0;
                        if (dist === len_k)
                            break;
                    }
                    if (dist === len_k) {
                        new_request_message = CONTEXT_VARS.words.slice(0, len_k).join(" ");
                        CONTEXT_VARS.words = CONTEXT_VARS.words.slice(len_k);
                        new_distance = new_request_message.length;
                    }
                    let d = DamerauLevenshteinDistance(new_request_message.toLowerCase(), k.toLowerCase());
                    if (d < new_distance) {
                        distance = d;
                        command = c;
                        key = k;
                        _request_message = new_request_message;
                        if (distance === 0) {
                            return gotAnswer(c);
                        } else if (distance < _request_message.length*BotConfig.TypoPercent) {
                            const { message, ...params } = await gotAnswer(c);
                            return {
                                message: message + BotConfig.KernelTexts.TypoPostMessage(key),
                                ...params
                            }
                        }
                    }
                }
            } else {
                for (const k of (c.keys.payload || [])) {
                    if (payload["command"] !== k) continue;
                    for (const [key, val] of Object.entries(payload)) {
                        if (key === "command") continue;
                        // @ts-ignore
                        CONTEXT_VARS.payload[key] = val;
                    }
                    command = c;
                    key = k;
                    SYS_VARS.isPayload = true;
                    return gotAnswer(c);
                }
            }
        }
    }
    return {
        message: undefined,
        attachments: undefined,
        keyboard: undefined,
        err: undefined
    }
}