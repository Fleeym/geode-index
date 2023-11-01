import config from "config/config";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { DataSource } from "typeorm";

// Used for CLI typeorm commands, because typeorm cli doesn't work with NestJS stuff

dotenvExpand.expand(dotenv.config());

export default new DataSource({
    type: "postgres",
    host: config().database.host,
    port: config().database.port,
    username: config().database.username,
    password: config().database.password,
    database: config().database.database,
    entities: [__dirname + "/../**/*.entity.js"],
    migrationsTableName: "migrations",
    synchronize: config().debug,
    extra: {
        charset: "utf8mb4_unicode_ci",
    },
});
