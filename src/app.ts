import express from "express";
// import path from "path";
import { botRouter } from "./routes/bot.js"
import {BotConfig} from "./bot/cfg.js";
import {InitVKFuncs} from "./bot/index.js";

const app = express();

InitVKFuncs();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(BotConfig.BotPath, botRouter);

app.listen(BotConfig.BotPort, () => console.log("Started!"))
