import { ContextVar } from "shared/types/ContextVar.js";
import { ResponseMessage } from "shared/types/ResponseMessage.js";
import {Command} from "../../../shared/types/Command.js";
import {SystemVar} from "../../../shared/types/SystemVar.js";
import {CommentState} from "../../handlers/CommentHandler.js";
import {AppDataSource} from "../../../database/index.js";
import {UserEntity} from "../../../database/entities/UserEntity.js";
import {PassportEntity} from "../../../database/entities/PassportEntity.js";
import {APIError, getRandomId, KeyboardBuilder, VKError} from "vk-io";
import {PassportCreateState} from "../../handlers/PassportCreatingHandler";

export class MVDPassportCommand extends Command {
    protected messageKeys: string[] = ["мвд паспорт"];
    protected payloadKeys: string[] = ["passport_mvd"];

    public accessLevel = 3;
    public showInList = false;

    public async process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage> {
        const { payload, words, comment: _comment, user } = context;
        const { isPayload } = sys_vars;
        const status = payload?.status || words[2] as "accepted" | "declined" | "edit";
        const comment = isPayload ? payload?.comment : _comment;
        const userRepo = AppDataSource.getRepository(UserEntity);
        const passportRepo = AppDataSource.getRepository(PassportEntity);
        const id = payload?.id || words[3]?.toLowerCase();
        const Passport = await passportRepo.findOneBy({ Id: id });
        if (!Passport) return {
            message: "📖 | Данного паспорта не существует"
        }
        const confirmUser = await userRepo.findOneBy({ Id: Passport.UserId })
        if (!confirmUser) return {
            message: "ЖОПА"
        }
        if (!comment && (status === "edit" || status === "declined")) {
            await this.handlerReroute<CommentState>(
                user,
                "comment",
                { addPayloadProp: "comment", payload: { id, status, command: "passport_mvd" } }
            );
            return {
                message: "📖 | Напишите, что надо изменить.\nПосле написания комментария ещё раз нажмите на кнопку с отправлением на доработку"
            }
        }
        try {
            if (status === "edit") {
                await this.vk.api.messages.send({
                    message: `📖 | Ваш паспорт был отправлен на доработку. Мы открываем вам обработчик сообщений паспорта...\n\nКомментарий:\n${comment}`,
                    random_id: getRandomId(),
                    peer_id: confirmUser.VkId
                });
                const splitedDate = Passport.Date.split(".");
                await this.handlerReroute<PassportCreateState>(confirmUser, "passport_creating", {
                    ...Passport,
                    Day: parseInt(splitedDate[0]),
                    Month: parseInt(splitedDate[1]),
                    Year: splitedDate[2],
                    Gender: (Passport.Gender === "Мужской" ? 1 : 2),
                    PhotoUrl: (await this.vk.upload.messagePhoto({ source: { value: Passport.Photo }, peer_id: confirmUser.VkId })).largeSizeUrl || ""
                });
                return {
                    message: "📖 | Паспорт отправлен на доработку. Ждите следующего сообщения"
                }
            }
            if (status === "declined") {
                await passportRepo.remove(Passport);
                await this.vk.api.messages.send({
                    message: "📖 | Ваш паспорт отклонён. Причина:\n" + comment,
                    random_id: getRandomId(),
                    peer_id: confirmUser.VkId
                });
                return {
                    message: `📖 | Паспорт [id${confirmUser.VkId}|пользователя ${confirmUser.Name}] отныне не явялется подтверждённым полностью. Причина:\n ${comment}`
                }
            }
        } catch (error) {
            if (error instanceof APIError) {
                if (error.code === 901) {
                    return {
                        message: "❌ | Сообщение не может быть отправлено так как пользователь запретил отправлять ему сообщения"
                    }
                }
            }
        }
        
        Passport.Stamps = ["accessed"];
        if(confirmUser.AccessLevel < 1) {
            confirmUser.AccessLevel = 1;
            await userRepo.save(confirmUser);
        };
        await passportRepo.save(Passport);
        await this.vk.api.messages.send({
            message: "📖 | Поздравляем Вас с получением гражданства Ловушкинской Федеративной Республики! С паспортом Ловушкинска вы можете, пока что, участвовать в выборах и получать государственные должности.",
            random_id: getRandomId(),
            peer_id: confirmUser.VkId,
            keyboard: new KeyboardBuilder().inline().callbackButton({ payload: { command: "show_passport" }, label: "Показать паспорт" })
        });
        return {
            message: `📖 | Паспорту ${Passport.Id} поставлен штамп "Подтвержденно". Теперь [id${confirmUser.VkId}|пользователь ${confirmUser.Name}] является гражданином!`
        }
    }
};