import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
} from "typeorm";
import { Mod } from "src/mods/entities/mod.entity";

export enum UserRole {
    ADMIN = "admin",
    DEV = "developer",
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    github_user_id: number;

    @Column("varchar", { length: 30, unique: true })
    username: string;

    @Column("varchar", { length: 30, nullable: true })
    display_name: string;

    @Column("boolean", { default: false })
    verified: boolean;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.DEV,
    })
    role: UserRole;

    @ManyToMany(() => Mod)
    @JoinTable({
        name: "mods_developers",
        joinColumn: { name: "developer_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "mod_id", referencedColumnName: "id" },
    })
    mods: Mod[];
}
