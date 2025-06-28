import { userSchema } from "@repo/schematype";
import { HttpStatusCode } from "axios";
import { compare, hash } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import prisma from "../utils/prismaClient";
import { SuccessResponse } from "../utils/SuccessResponse";
const JWT_SECRET: string = process.env.JWT_SECRET || "";

function generateJWTToken(data: {}) {
  return jwt.sign(data, JWT_SECRET);
}

function hashPassword(password: string) {
  return hash(password, 10);
}
export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parseResult = userSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "Invalid email or password format",
      );
    }

    // Check if email already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email: parseResult.data.email },
    });

    if (existingUser) {
      throw new AppError(HttpStatusCode.BadRequest, "Email is already in use");
    }

    const hashedPassword = await hashPassword(parseResult.data.password);
    const user = await prisma.user.create({
      data: {
        email: parseResult.data.email,
        password: hashedPassword,
        nickname: parseResult?.data?.email.split("@")[0],
        role: "User",
      },
    });

    const token = generateJWTToken({ userId: user.id, role: user.role });

    res
      .status(HttpStatusCode.Created)
      .json(new SuccessResponse("User created successfully", { token, userId: user.id }));
  } catch (error: any) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parseResult = userSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => {
        if (err.path[0] === 'email') return "Email is required";
        if (err.path[0] === 'password') return "Password is required";
        if (err.code === 'invalid_string' && err.validation === 'email') return "Invalid email format";
        if (err.code === 'too_small') return "Password is too weak";
        return err.message;
      });
      
      throw new AppError(
        HttpStatusCode.BadRequest,
        errors[0] || "Invalid email or password format",
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: parseResult.data.email,
      },
    });

    if (!user) {
      throw new AppError(HttpStatusCode.Unauthorized, "Invalid email or password");
    }

    const isPasswordCorrect = await compare(
      parseResult.data.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new AppError(HttpStatusCode.Unauthorized, "Invalid email or password");
    }

    const token = generateJWTToken({ userId: user.id, role: user.role });

    res
      .status(HttpStatusCode.Ok)
      .json({ success: true, message: "Login successful", data: { token, userId: user.id } });
  } catch (err) {
    next(err);
  }
};

export const tokenVerifierController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res
      .status(HttpStatusCode.Ok)
      .json(new SuccessResponse("authenticated successfully", {}));
  } catch (error) {
    next(error);
  }
};