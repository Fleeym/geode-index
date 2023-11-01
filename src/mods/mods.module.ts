import { Module } from "@nestjs/common";
import { ModsService } from "./mods.service";
import { ModsController } from "./mods.controller";
import { Mod } from "./entities/mod.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ResponseModule } from "src/response/response.module";

@Module({
    controllers: [ModsController],
    imports: [TypeOrmModule.forFeature([Mod]), ResponseModule],
    providers: [ModsService],
})
export class ModsModule {}
