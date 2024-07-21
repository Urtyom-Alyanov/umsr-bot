import {PayloadType} from "../../shared/types/PayloadType.js";
import {UnitedAttachment} from "../../shared/types/UnitedAttachment.js";
import {ResponseMessage} from "../../shared/types/ResponseMessage.js";
import {ErrorHandler} from "./ErrorHandler.js";
import {BotConfig} from "../cfg.js";
import vk from "../index.js";
import {AppDataSource} from "../../database/index.js";
import {UserEntity} from "../../database/entities/UserEntity.js";
import { HandlerList } from "./HandlerList.js";

export async function GetAnswer(request_message: string, from_id: number, peer_id: number, gId: number, payload?: PayloadType, attachments?: UnitedAttachment[]): Promise<ResponseMessage & { err?: Error }> {
    // Init repositories
    const UserRepository = AppDataSource.getRepository(UserEntity);

    // Get user VK
    const userVK = (await vk.api.users.get({ user_ids: [from_id] }))[0];

    // Get user
    let userCreated: boolean;
    let user = await UserRepository.findOneBy({ VkId: from_id });
    if (!user) {
        user = await UserRepository.save(UserRepository.create({
            Name: (userVK.first_name + " " + userVK.last_name),
            SocialRating: 100,
            AccessLevel: 1,
            VkId: from_id,
        }));
        userCreated = true;
    } else userCreated = false;

    // Get Handler
    const handler = HandlerList[user.UseHandler];
    try {
        const answer = await handler.start(user, from_id, peer_id, gId, request_message, payload, attachments);
        if (!answer.message && (!answer.attachments || answer.attachments?.length <= 1)) return {};
        if (userCreated) return { ...answer, message: answer.message + BotConfig.KernelTexts.UserCreated(user) }
        return answer;
    } catch (e) {
        // @ts-ignore | TS18046
        if (e.name === "AbortError") return { message: "⌚ | Запрос был отменен.\n\nСкорее всего вы пытались загрузить тяжеленькую картинку, но она, увы, слишком долго загружалась на сервера ВК, в связи с этим было решено прервать загрузку(((. Это может быть вызвано тем, что на данный момент у хоста плохой интернет" }
        if (user.UseHandler !== "commands")
            user.UseHandler = "commands";
        if (user.HandlerState)
            user.HandlerState = null;
        if (user.UseHandler !== "commands" || user.HandlerState)
            await UserRepository.save(user);
        const answer = ErrorHandler(e as Error);
        return { ...answer, err: e as Error }
    }
}