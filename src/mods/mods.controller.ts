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
} from "@nestjs/common";
import { ModsService } from "./mods.service";
import { CreateModDto } from "./dto/create-mod.dto";
import { ResponseService } from "src/response/response.service";
import { EntityNotFoundError } from "typeorm";

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
    async validate(@Param("id") id: string) {
        const result = await this.modsService.validate(id);
        if (!result) {
            throw new NotFoundException(
                this.responseService.createErrorResponse(HttpStatus.NOT_FOUND),
            );
        }
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
