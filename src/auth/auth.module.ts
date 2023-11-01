import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { GithubStrategy } from "./strategies/github.strategy";
import { ResponseModule } from "src/response/response.module";
import { HttpModule } from "@nestjs/axios";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshJwtStrategy } from "./strategies/jwt-refresh.strategy";

@Module({
    imports: [
        ResponseModule,
        HttpModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [GithubStrategy, AuthService, JwtStrategy, RefreshJwtStrategy],
})
export class AuthModule {}
