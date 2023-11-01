export class ApiResponse<T> {
    status: boolean;
    message: string;
    payload: T;

    constructor(payload: T, message: string = "", status: boolean = true) {
        this.message = message;
        this.payload = payload;
        this.status = status;
    }
}
