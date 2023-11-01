import { HttpService } from "@nestjs/axios";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { ResponseService } from "src/response/response.service";
import { User, UserRole } from "src/user/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly http: HttpService,
        private readonly configService: ConfigService,
        private readonly responseService: ResponseService,
        private readonly jwtService: JwtService,
    ) {}

    async githubAuth(token: string): Promise<string> {
        const response = await this.http.axiosRef.post<string>(
            "https://github.com/login/oauth/access_token",
            {
                client_id: this.configService.get<string>("github.client_id"),
                client_secret: this.configService.get<string>(
                    "github.client_secret",
                ),
                code: token,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
        const split = response.data.split("&");
        let parsed: any = {};
        split.forEach((kv: string) => {
            const [key, value] = kv.split("=");
            parsed[key] = value;
        });
        if (!parsed.access_token) {
            throw new UnauthorizedException(
                this.responseService.createResponse(
                    null,
                    "GitHub authentication failed. Please try again.",
                ),
            );
        }

        const githubUser = await this.http.axiosRef.get(
            "https://api.github.com/user",
            {
                headers: {
                    Authorization: `Bearer ${parsed.access_token}`,
                },
            },
        );
        if (!githubUser.data.id) {
            throw new UnauthorizedException(
                this.responseService.createResponse(
                    null,
                    "GitHub authentication failed. Please try again.",
                ),
            );
        }
        console.log(githubUser.data);
        const usernameLowercase = (
            githubUser.data.login as string
        ).toLowerCase();
        let user = await this.userRepository.findOne({
            where: {
                username: usernameLowercase,
            },
        });
        if (!user) {
            user = new User();
            user.github_user_id = githubUser.data.id;
            user.username = usernameLowercase;
            user.role = UserRole.DEV;
            user.verified = false;
            user.display_name = githubUser.data.login;
            this.userRepository.save(user);
        }

        const payload = {
            sub: user.id,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }
}
