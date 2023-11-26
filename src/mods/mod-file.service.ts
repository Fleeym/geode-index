import { HttpService } from "@nestjs/axios";
import { Injectable, BadRequestException } from "@nestjs/common";
import { randomUUID, createHash } from "crypto";
import {
    rmdirSync,
    mkdirSync,
    readFileSync,
    createWriteStream,
    unlinkSync,
} from "fs";
import * as StreamZip from "node-stream-zip";
import * as semver from "semver";
import { ResponseService } from "src/response/response.service";
import { ParsedModInfo } from "src/types/parsed-mod-info";
import { ModRelease } from "src/mod-release/entities/mod-release.entity";

@Injectable()
export class ModFileService {
    constructor(
        private readonly http: HttpService,
        private readonly responseService: ResponseService,
    ) {}

    async extractModData(filename: string): Promise<ParsedModInfo> {
        const output = "/tmp/" + randomUUID();
        mkdirSync(output);
        const zip = new StreamZip.async({ file: filename });
        const json = await zip.entryData("mod.json");
        const jsonParsed = JSON.parse(json.toString());
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

    async getHash(filename: string): Promise<string> {
        const buffer = readFileSync(filename);
        return createHash("sha256").update(buffer).digest("hex");
    }

    async downloadFile(url: string): Promise<string> {
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

    /**
     * Creates a mod release object from a download URL. Doesn't attach it to a mod.
     */
    async createModReleaseFromLink(
        modData: ParsedModInfo,
        hash: string,
        download_link: string,
    ): Promise<ModRelease> {
        if (!semver.valid(modData.version)) {
            throw new BadRequestException(
                this.responseService.createResponse(
                    null,
                    "Version isn't valid semver",
                    false,
                ),
            );
        }

        const release = new ModRelease();
        release.android = modData.android;
        release.windows = modData.windows;
        release.ios = modData.ios;
        release.mac = modData.mac;
        release.hash = hash;
        release.geode = modData.geodeVersion;
        release.version = modData.version;
        release.download_link = download_link;
        return release;
    }
}
