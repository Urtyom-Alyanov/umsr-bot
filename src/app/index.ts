import express from "express";
import { StartLongPool, botRouter } from "./routes/bot.js"
import {BotConfig} from "../bot/cfg.js";
import {InitVKFuncs} from "../bot/index.js";
import {AppDataSource} from "../database/index.js";

async function startApp() {
    await AppDataSource.initialize()
    InitVKFuncs();

    if (!BotConfig.UseLongpool) {
        const serverApp = express();

        serverApp.use(express.json());
        serverApp.use(express.urlencoded({ extended: false }));
        serverApp.use(BotConfig.BotPath, botRouter);
        
        return serverApp.listen(BotConfig.BotPort, () => console.log(`[Server] Started!\n\nPort: ${BotConfig.BotPort} | Callback Path ${BotConfig.BotPath} => ${BotConfig.CallbackPath}`))
    }
    if (BotConfig.UseLongpool) {
        StartLongPool().then(() => console.log("[LongPool] Started!"));
    }
}

startApp().catch(e => console.log(e));