import { Body, Controller, Patch } from "@nestjs/common";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller("me")
export class ProfileController {
    @Patch()
    update(@Body() data: UpdateProfileDto) {}
}
