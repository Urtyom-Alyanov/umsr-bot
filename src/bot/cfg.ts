export const BotConfig = {
    KernelTexts: {
        BugDetected: ("🐞 | Поймано исключение в выполнении кода.\n\n" +
            "Благо инженеры из Ловушкинской МФСР довольно умны и от одной ошибки в коде приложение не повалится, " +
            "а для вас это отличный стимул помочь этим инженерам в поиске ошибок в коде. " +
            "За каждую пойманную и подтвержденную ошибку вы получите вознаграждение в социальном рейтинге и средства " +
            "из государственной казны в размере 50Leuro.\n\n" +
            "Отправить отчет об ошибке?"),
        TypoPostMessage: (key: string) => (`\n\n-----------------------------\n\n`
            + `📚❗ | Товарищ! Пишите команды правильно! `
            +`Если бы не наши умные гигачады-инженеры из ЛМФСР, то ваша команда бы вовсе не распозналась. `
            + `Правильное написание - "${key}". Спасибо за внимние!`)
    },
    TypoPercent: 0.4, // 1 is 100%; Recommended 40%
    Token: "", // VK TOKEN
    CallbackPath: "/listening",
    BotPath: "/bot",
    BotPort: 5000,
    OpenAIKey: "sk-" // OPEN API KEY
}