class SuccessResponse<T> {
    success: boolean;
    message: string;
    data: T | null;

    constructor( message: string, data: T | null,) {
        this.success = true;
        this.message = message;
        this.data = data;
    }

}
