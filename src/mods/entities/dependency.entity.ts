import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { DependencyCompare } from "src/types/dependency-compare.enum";
import { ModRelease } from "src/mod-release/entities/mod-release.entity";
import { DependencyImportance } from "src/types/dependency-importance.enum";

@Entity("dependencies")
export class Dependency {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ select: false })
    dependent_id: string;

    @Column({ select: false })
    dependency_id: string;

    @Column({
        type: "enum",
        enum: DependencyCompare,
        default: DependencyCompare.EXACT,
    })
    compare: DependencyCompare;

    @Column({
        type: "enum",
        enum: DependencyImportance,
        default: DependencyImportance.RECOMMENDED,
    })
    importance: DependencyImportance;

    @ManyToOne(() => ModRelease, (dep) => dep.dependents)
    @JoinColumn({ name: "dependent_id", referencedColumnName: "id" })
    dependent: ModRelease;

    @ManyToOne(() => ModRelease, (mod) => mod.dependencies)
    @JoinColumn({ name: "dependency_id", referencedColumnName: "id" })
    dependency: ModRelease;
}
