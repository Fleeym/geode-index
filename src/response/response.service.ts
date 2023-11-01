import { HttpStatus, Injectable } from "@nestjs/common";
import { ApiResponse } from "src/types/ApiResponse";

@Injectable()
export class ResponseService {
    public createResponse<T>(
        payload: T,
        message: string = "",
        status = true,
    ): ApiResponse<T> {
        return new ApiResponse<T>(payload, message, status);
    }

    public createErrorResponse(code: HttpStatus): ApiResponse<null> {
        let status = "Unknown error";
        switch (code) {
            case HttpStatus.BAD_REQUEST:
                status = "Bad request";
                break;
            case HttpStatus.NOT_FOUND:
                status = "Not found";
                break;
            case HttpStatus.INTERNAL_SERVER_ERROR:
                status = "Internal server error";
                break;
        }
        return new ApiResponse(null, status, false);
    }
}
