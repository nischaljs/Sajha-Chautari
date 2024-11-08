import { HttpStatusCode } from "axios";

class AppError extends Error {
    statusCode: HttpStatusCode;
    message: string;

    constructor(statusCode: HttpStatusCode, message: string) {
        // here we are extending the Error class because it doesnot have the statusCode property and we want our error to have that as well so our main error only expects message to be passed when Error class constructor is called and since this error is just the instanc eof main error we need to pass the message to the main error
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }

    static handle(error: any) {
        // Check if error is already an instance of AppError
        //meaning if it is already beautified
        if (error instanceof AppError) {
            return error;
        }

        // For unhandled errors, assign a default status and message
        return new AppError(HttpStatusCode.InternalServerError, error.message || "An unexpected error occurred");
    }
}

export {AppError}