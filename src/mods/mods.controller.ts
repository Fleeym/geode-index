import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    NotFoundException,
} from "@nestjs/common";
import { ModsService } from "./mods.service";
import { CreateModDto } from "./dto/create-mod.dto";

@Controller({
    version: "1",
    path: "mods",
})
export class ModsController {
    constructor(private readonly modsService: ModsService) {}

    @Post()
    create(@Body() createModDto: CreateModDto) {
        return this.modsService.create(createModDto);
    }

    @Get()
    async findAll() {
        const all = await this.modsService.findAll();
        return all;
    }

    @Get(":id")
    async findOne(@Param("id") id: string) {
        const resource = await this.modsService.findOne(id);
        if (!resource) {
            throw new NotFoundException();
        }
        return resource;
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.modsService.remove(+id);
    }
}
