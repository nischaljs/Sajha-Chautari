import { userSchema } from "@repo/schematype";
import { HttpStatusCode } from "axios";
import { compare, hash } from 'bcrypt';
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { AppError } from "../utils/AppError";
import prisma from "../utils/prismaClient";
const JWT_SECRET: string = process.env.JWT_SECRET || ""

function generateJWTToken(data: {}) {
  return jwt.sign(data, JWT_SECRET);
}

function hashPassword(password: string) {
  return hash(password, 10);
}
export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = userSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(HttpStatusCode.BadRequest, "Invalid email or password fromat");
    }

    // Check if email already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email: parseResult.data.email }
    });

    if (existingUser) {
      throw new AppError(HttpStatusCode.BadRequest, "Email already registered");
    }

    const hashedPassword = await hashPassword(parseResult.data.password);
    const user = await prisma.user.create({
      data: {
        email: parseResult.data.email,
        password: hashedPassword,
        nickname:parseResult?.data?.email.split("@")[0],
        role: 'User'
      }
    })

    const token = generateJWTToken({ userId: user.id });

    res.status(HttpStatusCode.Created).json(new SuccessResponse("User created succesfully", { token }))

  }
  catch (error: any) {
    next(error)
  }
}


export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = userSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new AppError(HttpStatusCode.BadRequest, 'Email or Password format is incorrect');
    }


    const user = await prisma.user.findUnique({
      where: {
        email: parseResult.data.email,
      },
    });

    if (!user) {
      throw new AppError(HttpStatusCode.Forbidden, 'Invalid credentials');
    }


    const isPasswordCorrect = await compare(parseResult.data.password, user.password);

    if (!isPasswordCorrect) {
      throw new AppError(HttpStatusCode.Forbidden, 'Invalid credentials');
    }


    const token = generateJWTToken({ userId: user.id });


    res.status(HttpStatusCode.Ok).json({ success: true, message: 'Login successful', data: { token } });

  } catch (err) {
    next(err); 
  }
};
