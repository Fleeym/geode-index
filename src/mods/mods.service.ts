import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CreateModDto } from "./dto/create-mod.dto";
import { FindManyOptions, Repository } from "typeorm";
import { Mod } from "./entities/mod.entity";
import { InjectRepository } from "@nestjs/typeorm";
import * as semver from "semver";
import { ResponseService } from "src/response/response.service";
import { User } from "src/user/entities/user.entity";
import { ModRelease } from "src/mod-release/entities/mod-release.entity";
import { unlinkSync } from "fs";
import { ModFileService } from "./mod-file.service";
import { PaginatorService } from "src/paginator/paginator.service";
import { PaginatedData } from "src/types/paginated";

@Injectable()
export class ModsService {
    constructor(
        @InjectRepository(Mod)
        private readonly modRepository: Repository<Mod>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ModRelease)
        private readonly modReleaseRepository: Repository<ModRelease>,
        private readonly modFileService: ModFileService,
        private readonly responseService: ResponseService,
        private readonly paginatorService: PaginatorService,
    ) {}

    async create(createModDto: CreateModDto, developer_id: number) {
        if (!this.validateURL(createModDto.download_link)) {
            throw new BadRequestException(
                this.responseService.createResponse(
                    null,
                    "Invalid download link",
                    false,
                ),
            );
        }
        const filename = await this.modFileService.downloadFile(
            createModDto.download_link,
        );
        const hash = await this.modFileService.getHash(filename);
        const modData = await this.modFileService.extractModData(filename);
        if (!semver.valid(modData.version)) {
            throw new BadRequestException(
                this.responseService.createResponse(
                    null,
                    "Version isn't valid semver",
                    false,
                ),
            );
        }

        const sameId = await this.modRepository.findOne({
            where: {
                id: modData.id,
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
        mod.id = modData.id;
        mod.validated = false;
        mod.version = modData.version;
        mod.latest_download_link = createModDto.download_link;
        mod.latest_hash = hash;
        mod.description = modData.description;
        mod.geode = modData.geodeVersion;
        mod.name = modData.name;
        mod.tags = modData.tags.map((tag: string) => {
            const lowercase = tag.toLowerCase();
            return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
        });
        mod.windows = modData.windows;
        mod.android = modData.android;
        mod.mac = modData.mac;
        mod.ios = modData.ios;
        if (modData.repository) {
            if (!this.validateURL(modData.repository)) {
                throw new BadRequestException(
                    this.responseService.createResponse(
                        null,
                        "Invalid repository URL",
                        false,
                    ),
                );
            }
            mod.repository = modData.repository;
        }
        const dev = await this.userRepository.findOne({
            where: {
                id: developer_id,
            },
        });
        mod.developer = dev;
        unlinkSync(filename);
        await this.modRepository.save(mod);
        this.createFirstModRelease(mod);
    }

    async update(createModDto: CreateModDto) {
        if (!this.validateURL(createModDto.download_link)) {
            throw new BadRequestException(
                this.responseService.createResponse(
                    null,
                    "Invalid download link",
                    false,
                ),
            );
        }
        const filename = await this.modFileService.downloadFile(
            createModDto.download_link,
        );
        const hash = await this.modFileService.getHash(filename);
        const modData = await this.modFileService.extractModData(filename);
        const mod = await this.modRepository.findOne({
            where: {
                id: modData.id,
            },
        });

        if (!mod) {
            throw new NotFoundException(
                this.responseService.createErrorResponse(HttpStatus.NOT_FOUND),
            );
        }
        if (!mod.validated) {
            throw new BadRequestException(
                this.responseService.createResponse(
                    null,
                    "Cannot update a mod that isn't validated by an administrator",
                    false,
                ),
            );
        }

        if (semver.compare(mod.version, modData.version) !== -1) {
            throw new BadRequestException(
                this.responseService.createResponse(
                    null,
                    "Mod version should be higher than the latest one",
                    false,
                ),
            );
        }

        const release = await this.modFileService.createModReleaseFromLink(
            modData,
            hash,
            createModDto.download_link,
        );
        release.mod = mod;
        this.modReleaseRepository.save(release);

        mod.version = modData.version;
        mod.description = modData.description;
        mod.name = modData.name;
        mod.latest_hash = release.hash;
        mod.latest_download_link = createModDto.download_link;
        this.modRepository.save(mod);
    }

    validateURL(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    createFirstModRelease(mod: Mod) {
        const modRelease = new ModRelease();
        modRelease.mod = mod;
        modRelease.download_link = mod.latest_download_link;
        modRelease.hash = mod.latest_hash;
        modRelease.version = mod.version;
        modRelease.android = mod.android;
        modRelease.windows = mod.windows;
        modRelease.ios = mod.ios;
        modRelease.mac = mod.mac;
        modRelease.geode = mod.geode;
        this.modReleaseRepository.save(modRelease);
    }

    async validate(id: string): Promise<void> {
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

        if (mod.validated === true) {
            return;
        }

        mod.validated = true;
        this.modRepository.save(mod);
    }

    async findAll(
        validated?: boolean,
        page: number = 1,
        perPage: number = 10,
    ): Promise<PaginatedData<Mod>> {
        const options: FindManyOptions<Mod> = {
            relations: {
                developer: true,
            },
        };
        const builder = this.modRepository
            .createQueryBuilder("mod")
            .leftJoinAndSelect("mod.developer", "dev")
            .leftJoinAndSelect("mod.releases", "release")
            .leftJoinAndSelect("release.dependents", "dependent")
            .leftJoinAndSelect("dependent.dependent", "dependent_release")
            .leftJoinAndSelect("dependent_release.mod", "dependent_mod")
            .leftJoinAndSelect("release.dependencies", "dependency")
            .leftJoinAndSelect("dependency.dependency", "dependency_release")
            .leftJoinAndSelect("dependency_release.mod", "dependency_mod")
            .select([
                "mod",
                "release",
                "dependent.importance",
                "dependent_release",
                "dependent_mod",
                "dependency.compare",
                "dependency.importance",
                "dependency_release",
                "dependency_mod",
            ])
            .addOrderBy("mod.id", "ASC")
            .addOrderBy("release.version", "DESC");

        if (validated !== undefined) {
            builder.where("mod.validated = :validated", {
                validated: validated,
            });
        }

        return await this.paginatorService.paginate(builder, page, perPage);
    }

    async findOne(id: string): Promise<Mod> {
        const data = await this.modRepository.findOne({
            where: {
                id: id,
            },
            relations: {
                developer: true,
                releases: true,
            },
        });
        if (!data) {
            throw new NotFoundException();
        }

        return data;
    }

    remove(id: number) {
        return `This action removes a #${id} mod`;
    }
}
