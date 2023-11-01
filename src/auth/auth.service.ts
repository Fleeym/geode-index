import { HttpService } from "@nestjs/axios";
import {
    ForbiddenException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { ResponseService } from "src/response/response.service";
import { User, UserRole } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import * as argon2 from "argon2";

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

    async githubAuth(
        token: string,
    ): Promise<{ token: string; refreshToken: string }> {
        const response = await this.http.axiosRef.post(
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
                    Accept: "application/json",
                },
            },
        );
        const tokenResponse = response.data;
        if (!tokenResponse.access_token) {
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
                    Authorization: `Bearer ${tokenResponse.access_token}`,
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
        const usernameLowercase = (
            githubUser.data.login as string
        ).toLowerCase();
        let user = await this.userRepository.findOne({
            where: {
                github_user_id: githubUser.data.id,
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

        const tokens = await this.getTokens(user);
        user.refresh_token = await argon2.hash(tokens.refreshToken);
        this.userRepository.save(user);
        return tokens;
    }

    async refreshToken(userId: number, refreshToken: string) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId,
            },
        });
        if (!user || !user.refresh_token) {
            throw new ForbiddenException(
                this.responseService.createErrorResponse(HttpStatus.FORBIDDEN),
            );
        }

        const matches = await argon2.verify(user.refresh_token, refreshToken);
        if (!matches) {
            throw new ForbiddenException(
                this.responseService.createErrorResponse(HttpStatus.FORBIDDEN),
            );
        }

        const tokens = await this.getTokens(user);
        user.refresh_token = await argon2.hash(tokens.refreshToken);
        this.userRepository.save(user);
        return tokens;
    }

    async getTokens(
        user: User,
    ): Promise<{ token: string; refreshToken: string }> {
        const [token, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: user.id,
                    role: user.role,
                },
                {
                    secret: this.configService.get<string>("jwt_secret"),
                    expiresIn: "1d",
                },
            ),
            this.jwtService.signAsync(
                {
                    sub: user.id,
                    role: user.role,
                },
                {
                    secret: this.configService.get<string>(
                        "jwt_refresh_secret",
                    ),
                    expiresIn: "7d",
                },
            ),
        ]);
        return {
            token,
            refreshToken,
        };
    }
}
