import { Mod } from "src/mods/entities/mod.entity";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity("mod_releases")
export class ModRelease {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { length: 65 })
    version: string;

    @Column("varchar", { length: 255 })
    download_link: string;

    @Column("varchar", { length: 255 })
    hash: string;

    @Column("varchar", { length: 255 })
    hash256: string;

    @Column("varchar", { length: 65 })
    geode: string;

    @Column()
    windows: boolean;

    @Column()
    android: boolean;

    @Column()
    mac: boolean;

    @Column()
    ios: boolean;

    @ManyToOne(() => Mod, (mod) => mod.releases)
    @JoinColumn({ name: "mod_id", referencedColumnName: "id" })
    mod: Mod;
}
