import {
    Controller,
    Get,
    Post,
    Req,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { ResponseService } from "src/response/response.service";
import { AuthService } from "./auth.service";

@Controller({
    path: "auth",
    version: "1",
})
export class AuthController {
    constructor(
        private readonly responseService: ResponseService,
        private readonly authService: AuthService,
    ) {}
    @Get("login")
    @UseGuards(AuthGuard("github"))
    login() {}

    @Get("github/callback")
    async githubLoginCallback(@Req() req: Request) {
        const token = req.query["code"] as string;
        if (!token) {
            throw new UnauthorizedException(
                this.responseService.createResponse(
                    null,
                    "GitHub authentication failed. Please try again.",
                ),
            );
        }
        const jwt = await this.authService.githubAuth(token);
        return this.responseService.createResponse(jwt);
    }

    @Get("refresh")
    @UseGuards(AuthGuard("jwt-refresh"))
    async refreshToken(@Req() req: Request) {
        const userId = req.user["sub"];
        const refreshToken = req.user["refreshToken"];
        const tokens = await this.authService.refreshToken(
            userId,
            refreshToken,
        );
        return this.responseService.createResponse(tokens);
    }
}
