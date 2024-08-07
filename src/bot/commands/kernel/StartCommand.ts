import {Command} from "../../../shared/types/Command.js";
import {SystemVar} from "../../../shared/types/SystemVar.js";
import {ContextVar} from "../../../shared/types/ContextVar.js";
import {ResponseMessage} from "../../../shared/types/ResponseMessage.js";
import {Attachment, AttachmentType} from "vk-io";

export class StartCommand extends Command {
    payloadKeys = ["start"];
    messageKeys = ["начать", "старт", "start"];

    showInList = false;

    public async process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage> {
        return {
            message: 'Floco 3.0.\n\n' +
                'Приветствую товарищ! Как вы могли заметить в ЛФР появился свой бот. За основу нового бота был взят ' +
                'старый ловушкинский бот FalleBot (ранее APB, сокр. от Auto Passport Bot) 2.6 (https://vk.com/wall-193840305_3903), ' +
                'который был переписан с нуля и на другом языке программирования и с совсем другой архитектурой кода и ' +
                'папок. APB 2.6 сломался по причине того, что что-то произошло с базой данных, тем более, недавно, Heroku ' +
                'решило сделать услугу предоставления БД платной, отчего мы, конечно, недовольны.\n\n' +
                'Но, ладно, ближе к сути дела, я решил оживить проект бота, который делает паспорта автоматически.' +
                // 'появилась ещё одна идея - добавить интерактивности для ЛФР и увеличить обороноспобность с помощью системы уведомлений ' +
                // 'о спам атаках, которые, благо или неблаго, решайте сами, устаревают, и на смену приходят РП-войны. ' +
                'Также я хочу реализовать проект суверенного банка для ЛФР, тут вроде всё понятно, переводы и управление экономикой. ' +
                'Так же будет функция секса с РОБОТ-ЖЕНОЙ (или мужем), которая предоставляется бесплатно за социальные ' +
                'кредиты, которые я опишу позже. Секс привлечет больше актива и внимания для нашей Федерации.\n\n' +
                'Что же такое социальные кредиты? Это не валюта, однако скожесть со средствами есть! Например их можно накапливать ' +
                'и получать возможности, однако, в отличии от валюты, они тратятся по другому принципу, например если вы неактивите в своей республике, ' +
                'или вы совершили преступление, например рипнули одну из республик. Получить их проще, чем думается, например участвовать в выборах ' +
                '(необязательно даже побеждать), или как бурдыга делать контент для ЛФР, так же можно получить ' +
                'сие кредиты просто ища ошибки в этом боте.\n\n' +
                'Я описал примерный концепт бота Floco, я их этого собираюсь сделать что-то типа Госуслуг с небольшой смесью ТМЛ. ' +
                'Я собираюсь даже интегрировать НБМ, благо я как раз разраб НБМ.\n\n' +
                'Дабы посмотреть список команд, доступных для вас, напишите "команды"',
            attachments: [new Attachment({ api: this.vk.api, payload: { id: 457239541, owner_id: -192307020 }, type: AttachmentType.PHOTO })]
        }
    }
}