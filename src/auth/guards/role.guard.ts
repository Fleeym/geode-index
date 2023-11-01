import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User, UserRole } from "src/user/entities/user.entity";
import { ROLE_KEY } from "../decorators/role.decorator";
import { DataSource } from "typeorm";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(DataSource)
        private readonly dataSource: DataSource,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRole = this.reflector.getAllAndOverride<UserRole>(
            ROLE_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRole) {
            return true;
        }
        const req = context.switchToHttp().getRequest();
        const user = await this.dataSource.getRepository(User).findOne({
            where: {
                id: req.user.id,
            },
        });
        return user.role === requiredRole;
    }
}
