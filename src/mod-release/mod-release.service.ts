import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateModReleaseDto } from "./dto/create-mod-release.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Mod } from "src/mods/entities/mod.entity";
import { Repository } from "typeorm";
import { ResponseService } from "src/response/response.service";
import { ModRelease } from "./entities/mod-release.entity";

@Injectable()
export class ModReleaseService {
    constructor(
        @InjectRepository(Mod) private readonly modRepository: Repository<Mod>,
        @InjectRepository(ModRelease)
        private readonly modReleaseRepository: Repository<ModRelease>,
        private readonly responseService: ResponseService,
    ) {}
    create(createModReleaseDto: CreateModReleaseDto) {
        return "This action adds a new modRelease";
    }

    async findAll(modId: string) {
        const mod = await this.modRepository.findOne({
            where: {
                id: modId,
            },
        });
        if (!mod) {
            throw new NotFoundException(
                this.responseService.createErrorResponse(HttpStatus.NOT_FOUND),
            );
        }

        return await this.modReleaseRepository
            .createQueryBuilder("r")
            .where("r.mod_id = :id", { id: mod.id })
            .getMany();
    }

    async findOne(modId: string, version: string) {
        const mod = await this.modRepository.findOne({
            where: {
                id: modId,
            },
        });
        if (!mod) {
            throw new NotFoundException(
                this.responseService.createErrorResponse(HttpStatus.NOT_FOUND),
            );
        }

        return await this.modReleaseRepository
            .createQueryBuilder("r")
            .where("r.mod_id = :id", { id: mod.id })
            .andWhere("r.version = :version", { version: version })
            .getOne();
    }

    async remove(id: string, version: string) {
        const mod = await this.modRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!mod) {
            throw new NotFoundException(
                this.responseService.createErrorResponse(HttpStatus.NOT_FOUND),
            );
        }
        await this.modReleaseRepository
            .createQueryBuilder("r")
            .delete()
            .where("r.mod_id = :id", { id: id })
            .andWhere("r.version = :version", { version: version })
            .execute();
    }
}
