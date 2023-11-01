import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";

@Entity("mods")
export class Mod {
    @PrimaryColumn("varchar", { length: 100 })
    id: string;

    @Column("varchar", { length: 255 })
    latest_download_link: string;

    @Column("varchar", { length: 255 })
    latest_hash: string;

    @Column("varchar", { length: 255 })
    latest_hash256: string;

    @Column("varchar", { length: 255, nullable: true })
    repository_url: string;

    @Column("varchar", { length: 65 })
    version: string;

    @Column("boolean", { default: false })
    validated: boolean;

    @ManyToMany(() => User)
    @JoinTable({
        name: "mods_developers",
        joinColumn: { name: "mod_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "developer_id", referencedColumnName: "id" },
    })
    developers: User[];
}
