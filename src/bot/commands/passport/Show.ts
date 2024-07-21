import { Command } from "../../../shared/types/Command.js";
import { ContextVar } from "../../../shared/types/ContextVar.js";
import { ResponseMessage } from "../../../shared/types/ResponseMessage.js";
import { SystemVar } from "../../../shared/types/SystemVar.js";
import { AppDataSource } from "../../../database/index.js";
import { PassportEntity } from "../../../database/entities/PassportEntity.js";
import { UserEntity } from "../../../database/entities/UserEntity.js";
import {generatePassport} from "../../../shared/funcs/passport/generate.js";
import {PassportInputKeysEnum} from "../../../shared/types/PassportInputKeysEnum.js";
import crypto from "crypto-js";
import { BotConfig } from "../../cfg.js";

export class ShowPassportCommand extends Command {
    protected messageKeys: string[] = ["паспорт", "показать паспорт", "passport", "show passport"];
    protected payloadKeys: string[] = ["show_passport"];
    private passportRepo = AppDataSource.getRepository(PassportEntity);

    public description = "Получить паспорт, либо создать";

    public getPassport(user: UserEntity) {
        return this.passportRepo.findOneBy({ UserId: user.Id });
    }

    public async createPassport(user: UserEntity, isPersonalChat: boolean): Promise<ResponseMessage> {
        if (!isPersonalChat) return {
            message: "📙 | Ваш паспорт еще не создан. Для заполнения формы зайдите в личиные сообщения сообщества - https://vk.me/-193840305"
        };
        await this.handlerReroute(user, "passport_creating", {})
        return { message: "📙 | Ваш паспорт еще не создан. Поэтому начнём заполнение Вашего паспорта, гражданин!\nПосле заполенения паспорта вам будет предложено проверить ваши данные, если всё будет верно, то паспорт будет отправлен на проверку в Министерство Внутренних Дел ЛФР, где будет решено, ставить вам метку \"Подтверждено\", либо нет.\n\nНачнём с Вашего имени. Просто напишите Ваше имя (не фамилия и не отчество) в следущем сообщении." }
    }

    public async process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage> {
         const passport = await this.getPassport(context.user);
         if(!passport)
            return this.createPassport(context.user, sys_vars.fromId === sys_vars.peerId);

         const inputsGen: Omit<Record<PassportInputKeysEnum, string>, "sign"> = {
             date: passport.Date,
             gender: passport.Gender.slice(0, 3).toUpperCase(),
             nation: passport.Nation,
             id: passport.Id,
             name: passport.Name,
             patronymicname: passport.PatronymicName,
             surname: passport.SurName,
             placeOfBirthCity: passport.City,
             placeOfBirthRepublic: passport.Republic
         }
         const sign = crypto.SHA256(JSON.stringify({ ...inputsGen, key: BotConfig.SecretKey })).toString();
         return {
             attachments: [
                 await this.vk.upload.messagePhoto(
                     {
                         peer_id: sys_vars.peerId,
                         source: {
                             value: await generatePassport<PassportInputKeysEnum>(
                                 {
                                     ...inputsGen,
                                     sign
                                },
                                 passport.Photo,
                                 passport.Stamps
                             )
                         }
                     }
                 )
             ],
             message: `📖 | Ваш паспорт, гражданин!\n\nID паспорта: ${passport.Id}\nЭлектронная подпись паспорта: ${sign}`
         }
    }
}