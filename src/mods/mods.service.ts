import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateModDto } from "./dto/create-mod.dto";
import { FindManyOptions, Repository } from "typeorm";
import { Mod } from "./entities/mod.entity";
import { InjectRepository } from "@nestjs/typeorm";
import * as semver from "semver";
import { ResponseService } from "src/response/response.service";

@Injectable()
export class ModsService {
    constructor(
        @InjectRepository(Mod)
        private modRepository: Repository<Mod>,
        private responseService: ResponseService,
    ) {}

    async create(createModDto: CreateModDto) {
        if (!semver.valid(createModDto.version)) {
            throw new BadRequestException(
                this.responseService.createResponse(
                    null,
                    "Version isn't valid semver",
                    false,
                ),
            );
        }

        const sameId = this.modRepository.findOne({
            where: {
                id: createModDto.id,
            },
        });
        if (sameId !== null) {
            throw new BadRequestException(
                this.responseService.createResponse(
                    null,
                    "A mod with this ID already exists",
                    false,
                ),
            );
        }

        const mod = new Mod();
        mod.id = createModDto.id;
        mod.validated = false;
        mod.version = createModDto.version;
        if (createModDto.repository) {
            try {
                new URL(createModDto.repository);
            } catch (_) {
                throw new BadRequestException(
                    this.responseService.createResponse(
                        null,
                        "Invalid repository URL",
                        false,
                    ),
                );
            }
            mod.repository_url = createModDto.repository;
        }
    }

    async validate(id: string): Promise<Mod> {
        const mod = await this.modRepository.findOne({
            where: {
                id: id,
            },
        });
        if (!mod) {
            return null;
        }

        if (mod.validated === true) {
            return mod;
        }

        mod.validated = true;
        this.modRepository.save(mod);
        return mod;
    }

    findAll(validated?: boolean): Promise<Mod[]> {
        const options: FindManyOptions<Mod> = {
            relations: {
                developers: true,
            },
        };
        if (validated !== undefined) {
            options.where = {
                validated: validated,
            };
        }
        return this.modRepository.find(options);
    }

    findOne(id: string): Promise<Mod> {
        return this.modRepository.findOneOrFail({
            where: {
                id: id,
            },
        });
    }

    remove(id: number) {
        return `This action removes a #${id} mod`;
    }
}
