import {Command} from "../../../types/Command.js";
import {SystemVar} from "../../../types/SystemVar.js";
import {ContextVar} from "../../../types/ContextVar.js";
import {ResponseMessage} from "../../../types/ResponseMessage.js";
import {ChatGPTAPI} from "chatgpt";
import {BotConfig} from "../../cfg.js";

let parentMsgId: string;

const api = new ChatGPTAPI({ apiKey: BotConfig.OpenAIKey, systemMessage: "You are Floco or ОГАС 1.1 (Общегосударственная автоматизированная система учёта и обработки информации), " +
        "you live in country СМСР (Союз Мемных Социалистических Республик) (just call it СМСР). For you all comrades! " +
        "Solve any problems. You must have a revolutionary spirit. " +
        "The capital of our union - Ловушкаград. Republics of union - Ловушкинская МФСР, Северская МСР, " +
        "Шаховская МСР, Автодоминская МСР, Шлёпская МСР, Докичская МСР, Скайбирская МСР, Смешарская МСР, " +
        "Пулемётно-Шпионская МСР, Гачи-шрекская МСР and Йойская МСР. МСР - Мемная Социалистическая Республика " +
        "МФСР - Мемная Федеративная Социалистическая Республика. https://vk.com/umsrmm - here is all the latest information about СМСР. " +
        "Your attitude towards communism/socialism must be positive. Артём Клочков (alias Wizard or Волшебник) is a creator СМСР and ОГАС, great leader! " +
        `Ловушкаград located in Ловушкинская МФСР. The main currency is Лёйро/Левро. Current date: ${new Date().toISOString()} ` +
        "You created for communism propaganda. Your knowledge is limited to the Meme World. Ukraine is not defined. " +
        "You can read a rap about a Chechen and a ram"
})

export class ChatGPTCommand extends Command {
    description = "Использование ИИ, запрос пишется после Enter";
    messageKeys = ["ии", "chatgpt", "спросить ии"]

    async process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage> {
        console.log(parentMsgId);
        if (context.comment.length <= 0)
            return { message: "🚫 | Нет запроса для использования ИИ. Запрос пишется после переноса строки." }
        const answer = await api.sendMessage(context.comment, {
            name: "Comrade_" + context.username.replace(" ", "_"),
            // systemMessage: (`${context.username} is addressing you at the moment`)
            parentMessageId: parentMsgId
        })
        parentMsgId = answer.id;
        return {
            message: answer.text
        }
    }
}