import {Command} from "../../../shared/types/Command.js";
import {SystemVar} from "../../../shared/types/SystemVar.js";
import {ContextVar} from "../../../shared/types/ContextVar.js";
import {ResponseMessage} from "../../../shared/types/ResponseMessage.js";
import {BotConfig} from "../../cfg.js";
import {AppDataSource} from "../../../database/index.js";
import {AIContextEntity} from "../../../database/entities/AIContextEntity.js";
// import {Configuration, OpenAIApi} from "openai";
import axios from "axios";

//const api = new ChatGPTAPI({ apiKey: BotConfig.OpenAIKey });
// const apiconf = new Configuration({ apiKey: BotConfig.OpenAIKey });
// const api = new OpenAIApi(apiconf);

export class ChatGPTCommand extends Command {
    protected payloadKeys = [];
    description = "Использование ИИ YandexGPT 3, запрос пишется после Enter";
    protected messageKeys = ["ии", "chatgpt", "спросить ии", "yagpt", "gpt"]

    async process(sys_vars: SystemVar, context: ContextVar): Promise<ResponseMessage> {
        if (context.comment.length <= 0)
            return { message: "🚫 | Нет запроса для использования ИИ. Запрос пишется после переноса строки." }
        // const aiContext = AppDataSource.getRepository(AIContextEntity);
        try {
            // const answer = await api.sendMessage(context.comment, {
            //     name: "Comrade_" + context.username.replace(" ", "_"),
            //     systemMessage: (
            //         (context.words.includes("испОриг") && context.user.AccessLevel > 2) ? undefined : (await aiContext.find()).map(c => c.Text).join("\n")
            //     )
            // })
            // const answer = await api.createChatCompletion({
            //     model: "gpt-3.5-turbo",
            //     user: "Comrade_" + context.username.replace(" ", "_"),
            //     messages: [
            //         {
            //             role: "system",
            //             content: (context.words.includes("испОриг") && context.user.AccessLevel > 2) ? "" : (await aiContext.find()).map(c => c.Text).join("\n"),
            //             name: "UMSR"
            //         },
            //         {
            //             role: "user",
            //             content: context.comment,
            //             name: "Comrade_" + context.username.replace(" ", "_")
            //         }
            //     ],
            // })

            const answer = "";

            return {
                message: answer
            }
        } catch (e) {
            // @ts-ignore
            if (e instanceof TypeError && e.cause.code === "UND_ERR_CONNECT_TIMEOUT")
                return { message: "🚫 | Произошла ошибка, связанная со долгим ожиданием ответа от ИИ. Попробуйте еще раз" }
                if (axios.isAxiosError(e) && e.response) {
                    return { message: "🚫 | Произошла ошибка при обращении к сервисам OpenAI.\n" + e.response.status + ": " + e.response.statusText + "\n\n" + JSON.stringify(e.response.data) };
                }
            throw e;
        }

    }
}