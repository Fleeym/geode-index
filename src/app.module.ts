import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ModsModule } from "./mods/mods.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { ResponseModule } from "./response/response.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ProfileModule } from './profile/profile.module';
import config from "config/config";

@Module({
    imports: [
        ModsModule,
        ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
        }),
        DatabaseModule,
        ResponseModule,
        UserModule,
        AuthModule,
        ProfileModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
