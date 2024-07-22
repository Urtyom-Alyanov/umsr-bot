import {ResponseMessage} from "../../shared/types/ResponseMessage.js";
import {MsgHandler} from "../../shared/types/MsgHandler.js";
import {DocumentAttachment, getRandomId, IPhotoSize, Keyboard, PhotoAttachment} from "vk-io";
import axios from "axios";
import {generatePassport} from "../../shared/funcs/passport/generate.js";
import {PassportInputKeysEnum} from "../../shared/types/PassportInputKeysEnum.js";
import crypto from "crypto-js";
import {v4 as uuid} from "uuid";
import {getMVD, isMVD} from "../../shared/funcs/isMVD.js";
import {PassportEntity} from "../../database/entities/PassportEntity.js";
import {AppDataSource} from "../../database/index.js";
import { BotConfig } from "../cfg.js";

const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

export interface PassportCreateState extends Omit<PassportEntity, "Date" | "Photo" | "Gender"> {
    Year: string;
    Month: number;
    Day: number;
    PhotoUrl: string;
    Gender: 1 | 2;
}
type State = PassportCreateState;

export class PassportCreatingHandler extends MsgHandler<PassportCreateState> {
    public getName(): string {
        return "passport_creating";
    }

    private nextSettingInfo(state: State) {
        if (!state.Name) return { msg: "Начнём с Вашего имени. Просто напишите Ваше имя (не фамилия и не отчество) в следущем сообщении." }
        if (!state.SurName) return { msg: "Продолжим создание Вашего паспорта. Введите теперь фамилию." }
        if (!state.PatronymicName) return { msg: "Теперь ваше отчество." }
        const fullname = state.SurName + " " + state.Name + " " + state.PatronymicName;
        if (!state.Gender) return {
            msg: "Хорошо, " + fullname + ", перейдём ко второму этапу создадния вашего паспорта. Начнём с вашего пола.\n\n1 - Мужской\n2 - Женский\n\nНиже будет клавиатура, однако, если её нет, то просто введите цифру свыше.",
            kbr: Keyboard.builder().inline(true)
                .callbackButton({ label: "👨🏼 | Я мужчина", payload: { gender: 1 }, color: "primary" })
                .callbackButton({ label: "👩🏼 | Я женщина", payload: { gender: 2 }, color: "secondary" })
        }
        if (!state.Year) return {
            msg: "Теперь нам нужна ваша дата рождения, " + fullname + ", напишите ваш год рождения в следующем сообщении."
        }
        if (!state.Month) return {
            msg: fullname + ", теперь приступим к вашем месяцу.\n" + months.map((val, index) => `\n${index + 1} - XX ${val}`) + "\n\nГде XX - день вашего рождения. Также будет прикреплена клавиатура, на которой будет предложен выбор месяца. Если клавиатуры нет - то просто введите число.",
            kbr: Keyboard.keyboard(
                months
                .map((val, index) => ({ [index + 1]: val }))
                .reduce<Record<number, string>[][]>((prevVal, currVal) => {
                    if(prevVal[prevVal.length - 1].length === 4) {
                        prevVal.push([]);
                    }
                    prevVal[prevVal.length-1].push(currVal);
                    return prevVal;
                }, [[]]).map((val, iT) =>
                        val.map(
                            (val, i) => Keyboard.callbackButton({ label: `${iT*4 + i + 1} - ${val[iT*4 + i + 1]}`, payload: { month: iT*4 + i + 1 } })
                        )
                    )
                ).oneTime()
            }
        if (!state.Day) return {
            msg: fullname + ", давайте заменим XX на число. Для этого напишите просто число, не превышающее 31"
        }
        if (!state.Nation) return {
            msg: "Дорогой, " + fullname + ", к какой нации вы себя относите? В клавиатуре будут предложены некоторые нации для удобства, однако вы можете сами заполнить сию графу.",
            kbr: Keyboard.builder().inline()
                    .callbackButton({ label: "Ловушкер", payload: { nation: "Ловушкер" }, color: "primary" })
                    .callbackButton({ label: "Северец", payload: { nation: "Северец" }, color: "primary" })
                    .callbackButton({ label: "Калининец", payload: { nation: "Калининец" }, color: "primary" })
                    .callbackButton({ label: "Кекан", payload: { nation: "Кекан" }, color: "primary" })
                    .row()
                    // .callbackButton({ label: "Автодомиец", payload: { nation: "Автодомиец" }, color: "primary" })
                    // .callbackButton({ label: "Скайбирец", payload: { nation: "Скайбирец" }, color: "primary" })
                    // .callbackButton({ label: "Хэвик", payload: { nation: "Хэвик" }, color: "primary" })
                    // .row()
                    .callbackButton({ label: "Гардерниец", payload: { nation: "Гардерниец" }, color: "primary" })
                    .callbackButton({ label: "Эпиканец", payload: { nation: "Эпиканец" }, color: "primary" })
        }
        if (!state.Republic) return {
            msg: fullname + ", давайте заполним вашу графу с местом рождения. В какой республике СМСР/стране вы родились? Если здесь нет вашей страны, то просто напишите сообщение с названием Вашей страны",
            kbr: Keyboard.builder().inline()
                    .textButton({ label: "Ловушкинск" })
                    .textButton({ label: "Ловушкинская МФСР" })
                    // .textButton({ label: "Калиниская МСР" })
                    // .textButton({ label: "Пеперофцийская МСР" })
                    // .row()
                    // .textButton({ label: "Автодомийская МФСР" })
                    // .textButton({ label: "Скайбирская МСР" })
                    // .textButton({ label: "Пулемётная МСР" })
        }
        if (!state.City) return {
            msg: fullname + ", в каком городе вы родились?"
        }
        if (!state.PhotoUrl) return {
            msg: fullname + ", остался последний штрих! Отправьте в следующем сообщении изображение с вашим лицом. Желательно, чтобы у изображения были пропорции 3:4."
        }
        return {
            msg:
                fullname + ", все поля заполнены!\n" +
                "Однако вы можете поменять некоторую информацию командой \"!изменить\".\n\n" +
                "Для проверки заполненных полей напишите команду \"!проверить\"\n" +
                "Заполнить поля заново - \"!очистить\"\n" +
                "Для показа демонстрационного паспорта напишите - \"!демонстрация\"\n\n" +
                "Если вы заполнили все поля и готовы отправить на проверку в МВД ЛФР, то смело пишите \"!готов\"\n" + 
                "Если вы сюда попали случайно и хотите вернуться к командному обработчику сообщений, напишите - \"!отмена\"\n\n" +
                "Учтите, что Вы находитесь вне основного обрботчика сообщений и здесь не работают команды с ошибками, поэтому пишите ==ПРАВИЛЬНО==!"
        }
    }

    private async getBufferImageFromUrl(url: string): Promise<Buffer> {
        return axios.get(url, { responseType: "arraybuffer" }).then(val => Buffer.from(val.data, "binary"))
    }

    private bufferToAttachment(buf: Buffer): Promise<PhotoAttachment> {
        return this.vk.upload.messagePhoto({ source: { value: buf, timeout: 5000 }, peer_id: this.conversationId })
    }

    private async genPassport(): Promise<Buffer> {
        const state = this.getState();
        const buf = await this.getBufferImageFromUrl(state.PhotoUrl);
        const data: Omit<Record<PassportInputKeysEnum, string>, "sign"> = {
            id: uuid(),
            date: `${state.Day.toString().padStart(2, "0")}.${state.Month.toString().padStart(2, "0")}.${state.Year.toString().padStart(4, "0")}`,
            gender: state.Gender === 1 ? "МУЖ" : "ЖЕН",
            name: state.Name,
            surname: state.SurName,
            patronymicname: state.PatronymicName,
            nation: state.Nation,
            placeOfBirthCity: state.City,
            placeOfBirthRepublic: state.Republic
        };
        return generatePassport<PassportInputKeysEnum>({
            ...data,
            sign: crypto.SHA256(JSON.stringify({...data, key: BotConfig.SecretKey})).toString()
        }, buf, []);
    }

    private getInfo(): string {
        const state = this.getState();
        return `ФИО: ${state.SurName || "ФАМИЛИЯ"} ${state.Name || "ИМЯ"} ${state.PatronymicName || "ОТЧЕСТВО"}\n` +
            `Пол: ${state.Gender ? ["Мужской", "Женский"][state.Gender - 1] : "Не заполнено"}\n` +
            `Дата рождения: ${state.Day || "XX"}.${state.Month || "XX"}.${state.Year || "XXXX"}\n` +
            `Нация: ${state.Nation || "Не заполнено"}\n` +
            `Место рождения: ${state.Republic || "РЕСПУБЛИКА"}\n` +
            `${state.City || "ГОРОД"}\n` +
            `Ссылка на фото: ${state.PhotoUrl || "Не заполнено"}`
    }

    private async createPassportEntity(id: number, state: State) {
        const passportRepo = AppDataSource.getRepository(PassportEntity);
        const passport = passportRepo.create({
            ...state,
            Gender: ["Мужской", "Женский"][state.Gender - 1],
            Photo: await this.getBufferImageFromUrl(state.PhotoUrl),
            Date: `${state.Day.toString().padStart(2, "0") || "XX"}.${state.Month.toString().padStart(2, "0") || "XX"}.${state.Year.toString().padStart(4, "0") || "XXXX"}`,
            Stamps: isMVD(id) ? ["accessed"] : [],
            UserId: this.user.Id
        });
        return passportRepo.save(passport);
    }

    protected async process(): Promise<ResponseMessage> {
        if (this.senderId !== this.conversationId) return {};
        const state = this.getState();
        if (!state) await this.setState({});
        if (this.payload?.command) {
            if (this.payload?.command === "clear") {
                const graf = this.payload?.graf as keyof State;
                if (!graf) {
                    await this.setState({});
                    return {
                        message: "📙 | Мы очистили все поля, заполненные вами. Какое у вас имя?"
                    }
                }
                await this.addToState(graf, null);
                const { msg, kbr } = this.nextSettingInfo({ ...state, [graf]: null });
                return {
                    message: "📙 | Мы очистили поле \"" + graf + "\". Введите информацию вновь.\n\n" + msg,
                    keyboard: kbr
                }
            }
        }
        if (this.message?.startsWith("!")) {
            if (this.message === "!проверить") {
                return {
                    message: `📙 | В вашем паспорте заполнено:\n\n` + this.getInfo()
                }
            }
            if (this.message === "!демонстрация") {
                return {
                    attachments: [await this.bufferToAttachment(await this.genPassport())],
                    message: "‼ | Учтите, что данный паспорт не является средством идентификации и не имеет юридической силы на территории ЛФР и других стран.\nДействительный паспорт имеет штамп \"Подтвержденно\", выданный МВД ЛФР."
                }
            }
            if (this.message === "!очистить") {
                await this.setState({});
                return {
                    message: `📙 | Мы очистили все поля, заполненные вами. Какое у вас имя?`
                }
            }
            if (this.message === "!изменить") {
                return {
                    message: `📙 | Какое поле нужно очистить для изменения?`,
                    keyboard: Keyboard.builder().oneTime()
                        .callbackButton({ label: "Имя", payload: { command: "clear", graf: "Name" } })
                        .callbackButton({ label: "Фамилия", payload: { command: "clear", graf: "SurName" } })
                        .callbackButton({ label: "Отчество", payload: { command: "clear", graf: "PatronymicName" } })
                        .callbackButton({ label: "Пол", payload: { command: "clear", graf: "Gender" } })
                        .row()
                        .callbackButton({ label: "День рождения", payload: { command: "clear", graf: "Day" } })
                        .callbackButton({ label: "Месяц рождения", payload: { command: "clear", graf: "Month" } })
                        .callbackButton({ label: "Год рождения", payload: { command: "clear", graf: "Year" } })
                        .row()
                        .callbackButton({ label: "Родная страна/республика", payload: { command: "clear", graf: "Republic" } })
                        .callbackButton({ label: "Родной город", payload: { command: "clear", graf: "City" } })
                        .callbackButton({ label: "Нация", payload: { command: "clear", graf: "Nation" } })
                        .callbackButton({ label: "Фото", payload: { command: "clear", graf: "PhotoUrl" } })
                }
            }
            if (this.message === "!отмена") {
                await this.handlerReroute("commands");
                return {
                    message : "📙 | Хорошо, возвращаем вас обратно в командный обработчик событий..."
                }
            }
            if (this.message === "!готов") {
                const passport = await this.createPassportEntity(this.senderId, state);
                if (!passport.Stamps.includes("accessed"))
                    await this.vk.api.messages.send({
                        keyboard: Keyboard.builder().inline()
                            .callbackButton({ label: "Принять", payload: { command: "passport_mvd", status: "accepted", id: passport.Id, sId: this.senderId } })
                            .callbackButton({ label: "На доработку", payload: { command: "passport_mvd", status: "edit", id: passport.Id, sId: this.senderId } })
                            .callbackButton({ label: "Отклонить", payload: { command: "passport_mvd", status: "declined", id: passport.Id, sId: this.senderId } }),
                        message: "📙 | Здраствуйте! Требуется подтверждение паспорта для [id"+ this.senderId +"|пользователя]\n\n" + this.getInfo(),
                        attachment: [
                            await this.bufferToAttachment(await this.genPassport()),
                            await this.bufferToAttachment(await this.getBufferImageFromUrl(state.PhotoUrl))
                        ],
                        random_id: getRandomId(),
                        peer_ids: getMVD()
                    });
                await this.handlerReroute("commands");
                return {
                    message:
                        "📙 | Отправляем заполненную информацию Федеральному Министерству Внутренних Дел Ловушкинской Федеративной Республики.\n" +
                        (!passport.Stamps.includes("accessed") ? "Мы вас уведомим, если вашу заявку на гражданство примут, отклонят, или заставят заполнить иначе.\n\n" : "Ваш паспорт готов, гражданин, а также член МВД ЛФР.") +
                        "\nТакже перенаправляем вас обратно на командный обработчик сообщение..."
                }
            }
            if (this.message === "!помощь") {
                const {msg, kbr} = this.nextSettingInfo(state);
                return {
                    message: "📙 | Хорошо! Предоставляем вам инструкцию вновь." + "\n\n" + msg,
                    keyboard: kbr
                }
            }
            return {};
        }
        if (!state.Name) {
            await this.addToState("Name", this.message);
            const {msg, kbr} = this.nextSettingInfo({ ...state, Name: this.message as string });
            return {
                message: "📙 | Хорошо! Ваше имя было заполнено как " + this.message + "\n\n" + msg,
                keyboard: kbr
            }
        }
        if (!state.SurName) {
            await this.addToState("SurName", this.message);
            const {msg, kbr} = this.nextSettingInfo({ ...state, SurName: this.message as string });
            return {
                message: "📙 | Ваша фамилия - " + this.message + "\n\n" + msg,
                keyboard: kbr
            }
        }
        if (!state.PatronymicName) {
            await this.addToState("PatronymicName", this.message);
            const {msg, kbr} = this.nextSettingInfo({ ...state, PatronymicName: this.message as string });
            return {
                message: "📙 | Ваше отчество - " + this.message + "\n\n" + msg,
                keyboard: kbr
            }
        }
        const fullname = state.SurName + " " + state.Name + " " + state.PatronymicName;
        if (!state.Gender) {
            const gender = this.message ? parseInt(this.message) : this.payload?.gender;
            const genderText = gender === 1 ? "мужчина" : gender === 2 ? "женщина" : false;
            if (!genderText) return { message: "📙 | Неверное значение! Заполните ещё раз." }
            await this.addToState("Gender", gender);
            const {msg, kbr} = this.nextSettingInfo({ ...state, Gender: gender as 1 | 2 });
            return {
                message: "📙 | Хорошо, вы - " + genderText + ", гордитесь этим!\n\n" + msg,
                keyboard: kbr
            }
        }
        if (!state.Year) {
            const year = this.message;
            if (year?.length !== 4 || Number.isNaN(parseInt(year || ""))) return { message: "📙 | Неверное значение! Заполните ещё раз." }
            await this.addToState("Year", year);
            const {msg, kbr} = this.nextSettingInfo({ ...state, Year: year });
            return {
                message: "📙 | Хорошо, ваш год рождения - " + year + ".\n\n" + msg,
                keyboard: kbr
            }
        }
        if (!state.Month) {
            const month = this.message ? parseInt(this.message) : this.payload?.month;
            if (!month || month > 12 || month < 1) return { message: "📙 | Неверное значение! Заполните ещё раз." }
            await this.addToState("Month", month);
            const {msg, kbr} = this.nextSettingInfo({ ...state, Month: month });
            return {
                message: "📙 | Хорошо, ваш день и месяц рождения - XX " + months[month - 1] + ".\n\n" + msg,
                keyboard: kbr
            }
        }
        if (!state.Day) {
            const day = parseInt(this.message || "");
            if (!day || Number.isNaN(day) || day > 31 || day < 1) return { message: "📙 | Неверное значение! Заполните ещё раз." }
            await this.addToState("Day", day);
            const {msg, kbr} = this.nextSettingInfo({ ...state, Day: day });
            return {
                message: "📙 | Хорошо, ваша дата рождения заполенена как - " + day.toString().padStart(2, "0") + "." + state.Month.toString().padStart(2, "0") + "." + state.Year.toString().padStart(4, "0") + ".\n\n" + msg,
                keyboard: kbr
            }
        }
        if (!state.Nation) {
            const nation = this.payload?.nation ||  this.message;
            if (!nation) return { message: "📙 | Неверное значение! Заполните ещё раз." }
            await this.addToState("Nation", nation);
            const {msg, kbr} = this.nextSettingInfo({ ...state, Nation: nation });
            return {
                message: "📙 | Хорошо, мы записали вашу нацию как " + nation.toLowerCase() + ".\n\n" + msg,
                keyboard: kbr
            }
        }
        if (!state.Republic) {
            const republic = this.payload?.republic ||  this.message;
            if (!republic) return { message: "📙 | Неверное значение! Заполните ещё раз." }
            await this.addToState("Republic", republic);
            const {msg, kbr} = this.nextSettingInfo({ ...state, Republic: republic });
            return {
                message: "📙 | Хорошо, вы уроженец такой страны как " + republic + ".\n\n" + msg,
                keyboard: kbr
            }
        }
        if (!state.City) {
            const city = this.payload?.city ||  this.message;
            if (!city) return { message: "📙 | Неверное значение! Заполните ещё раз." }
            await this.addToState("City", city);
            const {msg, kbr} = this.nextSettingInfo({ ...state, City: city });
            return {
                message: "📙 | Хорошо, вы уроженец города " + city + ".\n\n" + msg,
                keyboard: kbr
            }
        }
        if (!state.PhotoUrl) {
            const photo = this.attachments?.filter(v => v.type === "photo" || (v.type === "doc" && (v as DocumentAttachment).isImage))[0] as PhotoAttachment | DocumentAttachment;
            if (!photo) return { message: "📙 | Неверное значение! Заполните ещё раз." }
            const photoFind = (a: IPhotoSize, b: IPhotoSize) => Math.abs(Math.abs(a.height)-400) - Math.abs(Math.abs(b.height)-400);
            const photoSizes = photo.type === "doc" ? (photo.preview?.photo as unknown as {sizes: IPhotoSize[]}).sizes.sort(photoFind) : photo.sizes?.sort(photoFind);
            if (!photoSizes) return { message: "📙 | Эм по какой то хуйне мы не получили размеры на ваше говно, отправьте еще раз." }
            const url = photoSizes[0].url || (photoSizes[0] as unknown as { src: string }).src ;
            if (!url) return { message: "📙 | Эм по какой то хуйне мы не получили ссылку на ваше говно, отправьте еще раз." }
            await this.addToState("PhotoUrl", url);
            const {msg, kbr} = this.nextSettingInfo({ ...state, PhotoUrl: url });
            return {
                message: "📙 | Хорошо, " + fullname + ", мы получили ссылку вашего изображения, которое вы отправили! Посмотрите, какой вы красавчик)\n\n" + url + " - ссылка на картинку кстати\n\n" + msg,
                keyboard: kbr
            }
        }
        return {}
    }
}