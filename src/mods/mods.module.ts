import { Module } from "@nestjs/common";
import { ModsService } from "./mods.service";
import { ModsController } from "./mods.controller";
import { Mod } from "./entities/mod.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ResponseModule } from "src/response/response.module";
import { User } from "src/user/entities/user.entity";
import { ModRelease } from "src/mod-release/entities/mod-release.entity";
import { HttpModule } from "@nestjs/axios";

@Module({
    controllers: [ModsController],
    imports: [
        TypeOrmModule.forFeature([Mod, User, ModRelease]),
        ResponseModule,
        HttpModule,
    ],
    providers: [ModsService],
})
export class ModsModule {}
