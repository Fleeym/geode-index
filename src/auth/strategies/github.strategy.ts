import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-github2";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get<string>("github.client_id"),
            clientSecret: configService.get<string>("github.client_secret"),
            callbackURL: "http://localhost:3000/v1/auth/github/callback",
        });
    }

    async validate(
        accessToken: string,
        _refreshToken: string,
        profile: Profile,
    ) {
        // expected to return null on failed validations, use this for later
        return profile;
    }
}
