import {DataSource} from "typeorm";
import * as path from "path";
import {UserEntity} from "./entities/UserEntity.js";
import {AIContextEntity} from "./entities/AIContextEntity.js";
import { PassportEntity } from "./entities/PassportEntity.js";

export const AppDataSource = new DataSource({
    type: "sqlite",
    synchronize: true,
    database: path.join(process.cwd(), "data", 'db.sqlite'),
    entities: [UserEntity, AIContextEntity, PassportEntity]
});