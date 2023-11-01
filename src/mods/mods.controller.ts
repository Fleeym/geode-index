import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    NotFoundException,
    Query,
    ParseBoolPipe,
    HttpStatus,
    UseGuards,
} from "@nestjs/common";
import { ModsService } from "./mods.service";
import { CreateModDto } from "./dto/create-mod.dto";
import { ResponseService } from "src/response/response.service";
import { EntityNotFoundError } from "typeorm";
import { RoleGuard } from "src/auth/guards/role.guard";
import { Role } from "src/auth/decorators/role.decorator";
import { UserRole } from "src/user/entities/user.entity";
import { AuthGuard } from "@nestjs/passport";

@Controller({
    version: "1",
    path: "mods",
})
export class ModsController {
    constructor(
        private readonly modsService: ModsService,
        private readonly responseService: ResponseService,
    ) {}

    @Post("")
    async create(@Body() createModDto: CreateModDto) {
        const res = await this.modsService.create(createModDto);
        return this.modsService.create(createModDto);
    }

    @Post("/validate/:id")
    @Role(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RoleGuard)
    async validate(@Param("id") id: string) {
        await this.modsService.validate(id);
        return this.responseService.createResponse(null);
    }

    @Get()
    async findAll(
        @Query("validated", new ParseBoolPipe({ optional: true }))
        validated?: boolean,
    ) {
        return this.responseService.createResponse(
            await this.modsService.findAll(validated),
        );
    }

    @Get(":id")
    async findOne(@Param("id") id: string) {
        try {
            const resource = await this.modsService.findOne(id);
            return resource;
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                throw new NotFoundException(
                    this.responseService.createErrorResponse(
                        HttpStatus.NOT_FOUND,
                    ),
                );
            }
        }
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.modsService.remove(+id);
    }
}
