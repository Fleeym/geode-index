import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy as PassportJwtStrategy } from "passport-jwt";
import { UserRole } from "src/user/entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy, "jwt") {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("jwt_secret"),
        });
    }

    validate(payload: { sub: number; role: UserRole }) {
        return payload;
    }
}
