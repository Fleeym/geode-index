import { Module } from "@nestjs/common";
import { ModReleaseService } from "./mod-release.service";
import { ModReleaseController } from "./mod-release.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mod } from "src/mods/entities/mod.entity";
import { ModRelease } from "./entities/mod-release.entity";
import { ResponseModule } from "src/response/response.module";
import { ModsModule } from "src/mods/mods.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Mod, ModRelease]),
        ResponseModule,
        ModsModule,
    ],
    exports: [ModReleaseService],
    controllers: [ModReleaseController],
    providers: [ModReleaseService],
})
export class ModReleaseModule {}
