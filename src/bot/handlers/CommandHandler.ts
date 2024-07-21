import { BotConfig } from "../cfg.js";
import { CommandList } from "../kernel/CommandList.js";
import { DamerauLevenshteinDistance } from "../../shared/funcs/DamerauLevenshteinDistance.js";
import { range } from "../../shared/funcs/range.js";
import { Command } from "../../shared/types/Command.js";
import { ContextVar } from "../../shared/types/ContextVar.js";
import { MsgHandler } from "../../shared/types/MsgHandler.js";
import { PayloadType } from "../../shared/types/PayloadType.js";
import { ResponseMessage } from "../../shared/types/ResponseMessage.js";
import { SystemVar } from "../../shared/types/SystemVar.js";
import {getRandomId} from "vk-io";

export class CommandMsgHandler extends MsgHandler {
    public getName(): string {
        return "commands";
    }

    private SYS_VARS!: SystemVar;
    private CONTEXT_VARS!: ContextVar;

    // Подготовка полезной нагрузки
    private preparingPayload(payload: PayloadType): false | Omit<PayloadType, "command"> {
        if (!payload["command"]) return false;
        const newPayload = {};
        for (const [key, val] of Object.entries(payload)) {
            if (key === "command") continue;
            // @ts-ignore
            newPayload[key] = val;
        }
        return newPayload;
    }

    // Путь для действия команды на основе контекстных параметров
    private payloadCommand(command: Command, payloadCommand: string, peerId: number) {
        for (const k of (command.keys.payload || [])) {
            if (payloadCommand !== k) continue;
            console.log(payloadCommand);
            this.SYS_VARS.isPayload = true;
            return this.getAnswerFromCommand(command, peerId);
        }
    }

    // Путь для действия команды на основе контекстных параметров
    private payloadFlow(c: Command, payload: PayloadType, peerId: number) {
        const command = payload.command;
        const newPayload = this.preparingPayload(payload);
        if (!newPayload) return;
        this.CONTEXT_VARS.payload = newPayload;
        return this.payloadCommand(c, command, peerId);
    }

    // Проверка на префикс и удаление его
    private prefixMessage(msg: string) {
    if (this.conversationId !== this.senderId && !msg.startsWith("!"))
        return false;

    if (msg.startsWith("!"))
        return msg.slice(1);

    return msg;
    }

    // Первый объект в массиве - прошло ли сообщение, второй - есть ли ошибки в тексте
    private damerauLevensgtein(k: string, words: string[]): [boolean, boolean] {
        let req_msg = "";
        let new_words = [];
        let distance = 0;
        const len_k = k.split(" ").length;
        if (len_k > words.length)
            return [false, false]
        let dist = 0;
        for (const kw of range(len_k)) {
            const a: string = words[kw];
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
            req_msg = words.slice(0, len_k).join(" ");
            new_words = words.slice(len_k);
            distance = req_msg.length;
        }
        let d = DamerauLevenshteinDistance(req_msg.toLowerCase(), k.toLowerCase());
        if (d < distance) {
            if (d === 0) {
                return [true, false]
            } else if (d < req_msg.length*BotConfig.TypoPercent) {
                return [true, true]
            }
        }
        return [false, false]
    }
    
    // Путь для действия команды на основе сообщения
    private async messageFlow(c: Command, words: string[], peerId: number): Promise<ResponseMessage | undefined> {
        for (const k of (c.keys.messages || [])) {
            const [isThisCommand, isTypoError] = this.damerauLevensgtein(k, words);
            if (isThisCommand) {
                if (isTypoError) {
                    const { message, ...others } = await this.getAnswerFromCommand(c, peerId);
                    return {
                        message: message + BotConfig.KernelTexts.TypoPostMessage(k),
                        ...others
                    }
                }
                return this.getAnswerFromCommand(c, peerId);
            }
        }
    }    

    // Получение из команды ответа (для обоих потоков) и предварительные проверки
    private async getAnswerFromCommand(c: Command, peerId: number): Promise<ResponseMessage> {
        if (!this.user) return {
            message: "🚫👤 | Пользователя не существует"
        }
        if (c.accessLevel > this.user.AccessLevel) return {
            message: "🚫👤 | Пользователь не имеет соответствующего уровня доступа"
        }
        if (c.socialRating > this.user.SocialRating) return {
            message: "🚫👤 | Пользователь не имеет соответствующего социального рейтинга"
        }
        let _message, _attachments, _keyboard
        await this.vk.api.messages.markAsRead({ peer_id: this.conversationId, mark_conversation_as_read: true });
        const intervalId = setInterval(async () =>
            await this.vk.api.messages.setActivity({ peer_id: this.conversationId, type: "typing" }), 5000);
        const timeoutId = setTimeout(async () =>
            await this.vk.api.messages.send({ message: "⌚ | Команда выполняется дольше ожиданных 5 секунд... Просим запастись терпением", peer_id: peerId, random_id: getRandomId() }), 5000)
        let {message, attachments, keyboard} = await c.process(this.SYS_VARS, this.CONTEXT_VARS)
        // if (from_id !== peer_id && (message || "").length > 1000)
        //     _message = "🚫 | Сообщение для конфы вышло слишком объемным (более 1000 символов), напишите в ЛС"
        // else
            _message = message;
        _attachments = attachments;
        _keyboard = keyboard;
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        return {message: _message, attachments: _attachments, keyboard: _keyboard}
    }

    // Инициализация контекста и системных констант
    private initParams(msg: string) {
        this.CONTEXT_VARS = {
            words: msg.split("\n")[0].split(" ") || [],
            comment: msg.split("\n").slice(1).join("\n") || "",
            attachments: this.attachments,
            payload: (this.payload || {}),
            username: this.user.Name,
            user: this.user
        };
        this.SYS_VARS = {
            fromId: this.senderId,
            peerId: this.conversationId,
            groupId: this.groupId,
            isPayload: !!this.payload?.command
        };
    }

    public async process() {
        if (!this.message) return {};
        const msg = this.prefixMessage(this.message);  
        if (!msg) return {};
        this.initParams(msg);

        for (const c of CommandList) {
            if (!this.SYS_VARS.isPayload && this.CONTEXT_VARS.words.length > 0) {
                const resp = await this.messageFlow(c, this.CONTEXT_VARS.words, this.SYS_VARS.peerId);
                if (!resp) continue;
                return resp;
            } else if (this.CONTEXT_VARS.payload) {
                const resp = await this.payloadFlow(c, this.payload as PayloadType, this.SYS_VARS.peerId);
                if (!resp) continue;
                return resp;
            }
        }
        return {};
    }
}
