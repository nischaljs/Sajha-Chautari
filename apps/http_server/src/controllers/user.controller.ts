import { userUpdateSchema, userUpdateType } from "@repo/schematype";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import prisma from "../utils/prismaClient";


export const profileUpdateController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedData: userUpdateType = userUpdateSchema.safeParse(req.body);
        if (!parsedData.success) {
            throw new AppError(HttpStatusCode.BadRequest, 'Invalid profile data');
        }
        const avatar = await prisma.avatar.findUnique({
            where: {
                id: parsedData.data.avatarId,
            },
        });

        if (!avatar) {
            throw new AppError(HttpStatusCode.BadRequest, "Avatar not found")
        }

        const user = await prisma.user.update({
            data: {
                nickname: parsedData.data.nickname,
                avatarId: parsedData.data.avatarId,
            },
            where: {
                id: req.userId,
            },
        });

        res.json(new SuccessResponse("User Updated Successfully", user));
    } catch (error) {
        next(error);
    }
}


export const getAvatarsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const avatars = await prisma.avatar.findMany();
        res.status(HttpStatusCode.Ok).json(new SuccessResponse("Available avatars retrieved successfully", avatars));
    } catch (error) {
        next(error);
    }
}


export const getMultipleUsersProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profileIds: string[] = Array.isArray(req.query.ids)
            ? req.query.ids as string[] 
            : req.query.ids
                ? [req.query.ids as string]
                : [];

        const profiles = await Promise.all(
            profileIds.map(async (uid) => {
                return await prisma.user.findFirst({
                    where: {
                        id: uid
                    },
                    select: {
                        id: true,
                        nickname: true,
                        avatar: {
                            select: {
                                imageUrl: true
                            }
                        }
                    }
                });
            })
        );


        const data = profiles.filter(profile => profile !== null);

        res.status(200).json(new SuccessResponse('User profiles retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};
