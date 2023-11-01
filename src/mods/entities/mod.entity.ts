import { ModRelease } from "src/mod-release/entities/mod-release.entity";
import { User } from "src/user/entities/user.entity";
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
} from "typeorm";

@Entity("mods")
export class Mod {
    @Index("modid-idx")
    @PrimaryColumn("varchar", { length: 100 })
    id: string;

    @Column("varchar", { length: 50 })
    name: string;

    @Column()
    description: string;

    @Column()
    windows: boolean;

    @Column()
    android: boolean;

    @Column()
    mac: boolean;

    @Column()
    ios: boolean;

    @Column("varchar", { length: 255 })
    latest_download_link: string;

    @Column("varchar", { length: 255 })
    latest_hash: string;

    @Column("varchar", { length: 255 })
    latest_hash256: string;

    @Column("varchar", { length: 255, nullable: true })
    repository: string;

    @Column("varchar", { length: 65 })
    version: string;

    @Column("varchar", { length: 65 })
    geode: string;

    @Column("boolean", { default: false })
    validated: boolean;

    @Column("text", { nullable: true, array: true })
    tags: string[];

    @OneToMany(() => ModRelease, (release) => release.mod)
    releases: ModRelease[];

    @ManyToOne(() => User)
    @JoinColumn({ name: "developer_id", referencedColumnName: "id" })
    developer: User;
}
