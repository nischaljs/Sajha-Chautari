import { NextFunction, Request, Response } from "express"
import { AppError } from "../src/utils/AppError"

export const GlobalErrorHandler = () =>{
    return (err:Error, req:Request, res:Response, next:NextFunction) =>{
        const handledError = AppError.handle(err);


        const isDevelopment = process.env.NODE_ENV === 'development';

        if(isDevelopment){
            res.status(handledError.statusCode).json({
                success:"false",
                message:handledError.message,
                error:err
            })
        } else {
            res.status(handledError.statusCode).json({
                success:false,
                message:handledError.message,
                data:{}
            })
        }
    }
}