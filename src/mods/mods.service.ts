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
import { HttpService } from "@nestjs/axios";
import {
    createWriteStream,
    mkdirSync,
    readFileSync,
    rmdirSync,
    unlinkSync,
} from "fs";
import { createHash, randomUUID } from "crypto";
import * as StreamZip from "node-stream-zip";

type ParsedModInfo = {
    id: string;
    name: string;
    description: string;
    windows: boolean;
    mac: boolean;
    ios: boolean;
    android: boolean;
    tags: string[];
    geodeVersion: string;
    version: string;
    repository?: string;
};

@Injectable()
export class ModsService {
    constructor(
        @InjectRepository(Mod)
        private modRepository: Repository<Mod>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(ModRelease)
        private modReleaseRepository: Repository<ModRelease>,
        private responseService: ResponseService,
        private http: HttpService,
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
        const filename = await this.downloadFile(createModDto.download_link);
        const { hash, hash256 } = await this.getHashes(filename);
        const modData = await this.extractModData(filename);
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
        mod.latest_hash256 = hash256;
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
        // await this.modRepository.save(mod);
        // this.createFirstModRelease(mod);
        console.log(mod);
    }

    validateURL(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    async extractModData(filename: string): Promise<ParsedModInfo> {
        const output = "/tmp/" + randomUUID();
        mkdirSync(output);
        const zip = new StreamZip.async({ file: filename });
        const json = await zip.entryData("mod.json");
        const jsonParsed = JSON.parse(json.toString());
        console.log(jsonParsed);
        let windows = false;
        let mac = false;
        let android = false;
        let ios = false;
        Object.values(await zip.entries()).forEach(
            (entry: StreamZip.ZipEntry) => {
                if (entry.name === `${jsonParsed["id"]}.dll`) {
                    windows = true;
                }
                if (entry.name === `${jsonParsed["id"]}.dylib`) {
                    mac = true;
                }
                if (entry.name === `${jsonParsed["id"]}.so`) {
                    android = true;
                }
                if (entry.name === `${jsonParsed["id"]}.ios.dylib`) {
                    ios = true;
                }
            },
        );
        rmdirSync(output);
        const parsedInfo: ParsedModInfo = {
            name: jsonParsed["name"],
            description: jsonParsed["description"],
            windows: windows,
            mac: mac,
            ios: ios,
            android: android,
            tags: jsonParsed["tags"] ?? [],
            geodeVersion: jsonParsed["geode"],
            repository: jsonParsed["repository"],
            id: jsonParsed["id"],
            version: jsonParsed["version"],
        };
        zip.close();
        return parsedInfo;
    }

    async getHashes(
        filename: string,
    ): Promise<{ hash: string; hash256: string }> {
        const buffer = readFileSync(filename);
        const hash256 = createHash("sha256").update(buffer).digest("hex");
        const hash3 = createHash("sha3-256").update(buffer).digest("hex");
        return {
            hash: hash3,
            hash256: hash256,
        };
    }

    private async downloadFile(url: string): Promise<string> {
        const filepath = "/tmp/" + randomUUID();
        const writer = createWriteStream(filepath);
        const res = await this.http.axiosRef.get(url, {
            responseType: "stream",
        });
        return new Promise((resolve, reject) => {
            res.data.pipe(writer);
            let error = null;
            writer.on("error", (err) => {
                error = err;
                writer.close();
                reject(error);
                return;
            });

            writer.on("close", () => {
                resolve(filepath);
            });
        });
    }

    createFirstModRelease(mod: Mod) {
        const modRelease = new ModRelease();
        modRelease.mod = mod;
        modRelease.download_link = mod.latest_download_link;
        modRelease.hash = mod.latest_hash;
        modRelease.hash256 = mod.latest_hash256;
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

    findAll(validated?: boolean): Promise<Mod[]> {
        const options: FindManyOptions<Mod> = {
            relations: {
                developer: true,
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
