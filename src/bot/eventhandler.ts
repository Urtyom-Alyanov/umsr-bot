import vk from "./index.js";
import {getRandomId} from "vk-io";
import {GetAnswer} from "./kernel/GetAnswer.js";

vk.updates.on("message_new", async (ctx) => {
    const { message, attachments, keyboard, err } = await GetAnswer(ctx.text || "", ctx.senderId, ctx.peerId, ctx.$groupId || -1, ctx.messagePayload, ctx.attachments);
    if (message || attachments) {
        await vk.api.messages.send({
            keyboard, message, attachment: attachments, peer_id: ctx.peerId, reply_to: ctx.id, random_id: getRandomId()
        })
        if (err) throw err;
    }
})

vk.updates.on("message_event", async (ctx) => {
    const { message, attachments, keyboard, err } = await GetAnswer("", ctx.userId, ctx.peerId, ctx.$groupId || -1, ctx.eventPayload, []);
    if (message || attachments) {
        if (err) throw err;
        await vk.api.messages.send({
            keyboard, message, attachment: attachments, peer_id: ctx.peerId, reply_to: ctx.id, random_id: getRandomId()
        })
    }
})

export const EventHandler = vk.updates;