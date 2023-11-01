import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get<string>("database.host"),
                port: configService.get<number>("database.port"),
                username: configService.get<string>("database.username"),
                password: configService.get<string>("database.password"),
                database: configService.get<string>("database.database"),
                entities: [__dirname + "/../../**/*.entity.js"],
                migrationsTableName: "migrations",
                synchronize: configService.get<boolean>("debug"),
                extra: {
                    charset: "utf8mb4_unicode_ci",
                },
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}
