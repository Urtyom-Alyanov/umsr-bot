import {Router} from "express";
import {EventHandler} from "../../bot/eventhandler.js";
import {BotConfig} from "../../bot/cfg.js";

export const botRouter = Router();

export function StartLongPool() {
    return EventHandler.start();
}

botRouter.post(BotConfig.CallbackPath, EventHandler.getWebhookCallback());