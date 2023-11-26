import { Injectable } from "@nestjs/common";
import { PaginatedData } from "src/types/paginated";
import { SelectQueryBuilder } from "typeorm";

@Injectable()
export class PaginatorService {
    async paginate<T>(
        builder: SelectQueryBuilder<T>,
        page: number = 1,
        perPage: number = 10,
    ): Promise<PaginatedData<T>> {
        builder.skip((page - 1) * perPage).take(perPage);
        const [data, count] = await builder.getManyAndCount();

        return {
            data: data,
            count: count,
            totalPages: Math.ceil(count / perPage),
        };
    }
}
