import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { HttpStatusCode } from "axios";
import { decode, verify } from "jsonwebtoken";

const JWT_SECRET: any = process.env.JWT_SECRET ;

export enum role {
  User,
  Admin,
}

function authmiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    //checking for the headers
    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) {
        throw new AppError(
          HttpStatusCode.Unauthorized,
          "You are not authorized",
        );
      }
      const decoded = verify(token, JWT_SECRET) as {
        userId: string;
        role: role;
      };
      console.log("decoded string", decoded)
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      console.log("the user is a ", req.userRole)
      next();
    } catch (error) {
      next(error);
    }
  };
}

export default authmiddleware;
