import {UserEntity} from "../database/entities/UserEntity";
import 'dotenv/config'

export const BotConfig = {
    KernelTexts: {
        BugDetected: ("🐞 | Поймано исключение в выполнении кода.\n\n" +
            "Благо инженеры из Ловушкинской Федеративной Республики довольно умны и от одной ошибки в коде приложение не повалится, " +
            "а для вас это отличный стимул помочь этим инженерам в поиске ошибок в коде. " +
            "За каждую пойманную и подтвержденную ошибку вы получите вознаграждение в социальном рейтинге и средства " +
            "из государственной казны в размере 10Leuro.\n\n" +
            "Отправить отчет об ошибке?"),
        TypoPostMessage: (key: string) => (`\n\n-----------------------------\n\n`
            + `📚❗ | Товарищ! Пишите команды правильно! `
            +`Если бы не наши умные гигачады-инженеры из Ловушкинска, то ваша команда бы вовсе не распозналась. `
            + `Правильное написание - "${key}". Спасибо за внимние!`),
        UserCreated: (user: UserEntity) => (
            "\n\n-----------------------------\n\n" +
            `👤✅ | Был успешно создан пользователь с именем ${user.Name}. Социальный рейтинг составляет ${user.SocialRating}FSCP ` +
            `а уровень доступа ${user.AccessLevel}. Id пользователя ${user.Id}.`
        )
    },
    TypoPercent: 0.4, // 1 is 100%; Recommended 40%
    Token: process.env.VK_TOKEN, // VK TOKEN
    CallbackPath: "/listening",
    BotPath: "/bot",
    BotPort: 5070,
    IAMToken: process.env.IAMToken,
    SecretKey: process.env.SECRET_KEY,
    UseLongpool: JSON.parse(process.env.LONGPOOL || "true") as boolean,
    VkSecretKey: process.env.VK_SECRET_KEY
}