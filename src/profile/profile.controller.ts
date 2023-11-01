import { Body, Controller, Patch, UseGuards } from "@nestjs/common";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("me")
export class ProfileController {
    @Patch()
    @UseGuards(AuthGuard("jwt"))
    update(@Body() data: UpdateProfileDto) {}
}
