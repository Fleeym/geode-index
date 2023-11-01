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

@Module({
    imports: [
        ResponseModule,
        HttpModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => {
                return {
                    signOptions: { expiresIn: "10h" },
                    secret: configService.get<string>("jwt_secret"),
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [GithubStrategy, AuthService],
})
export class AuthModule {}
