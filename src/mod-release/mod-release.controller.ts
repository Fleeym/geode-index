import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    NotFoundException,
    HttpStatus,
    UseGuards,
} from "@nestjs/common";
import { ModReleaseService } from "./mod-release.service";
import { CreateModReleaseDto } from "./dto/create-mod-release.dto";
import { ResponseService } from "src/response/response.service";
import { Role } from "src/auth/decorators/role.decorator";
import { UserRole } from "src/user/entities/user.entity";
import { AuthGuard } from "@nestjs/passport";
import { RoleGuard } from "src/auth/guards/role.guard";

@Controller({
    version: "1",
    path: "mods",
})
export class ModReleaseController {
    constructor(
        private readonly modReleaseService: ModReleaseService,
        private readonly responseService: ResponseService,
    ) {}

    @Post(":id/versions")
    create(@Body() createModReleaseDto: CreateModReleaseDto) {
        return this.modReleaseService.create(createModReleaseDto);
    }

    @Get(":id")
    findAll(@Param("id") modId: string) {
        return this.modReleaseService.findAll(modId);
    }

    @Get(":id/:version")
    async findOne(@Param("id") id: string, @Param("version") version: string) {
        const release = await this.modReleaseService.findOne(id, version);
        if (!release) {
            throw new NotFoundException(
                this.responseService.createErrorResponse(HttpStatus.NOT_FOUND),
            );
        }

        return release;
    }

    @Role(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RoleGuard)
    @Delete(":id/:version")
    remove(@Param("id") id: string, @Param("version") version: string) {
        return this.modReleaseService.remove(id, version);
    }
}
