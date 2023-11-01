import { Controller, Get, Param, Delete, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { Role } from "src/auth/decorators/role.decorator";
import { UserRole } from "./entities/user.entity";
import { AuthGuard } from "@nestjs/passport";
import { RoleGuard } from "src/auth/guards/role.guard";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.userService.findOne(+id);
    }

    @Delete(":id")
    @Role(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RoleGuard)
    remove(@Param("id") id: string) {
        return this.userService.remove(+id);
    }
}
