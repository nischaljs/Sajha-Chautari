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


export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const spaceId = req.body.spaceId;

        const userdata = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                avatar: {
                    select: {
                        imageUrl: true
                    }
                }
            }
        })
        const spaceData = await prisma.space.findFirst({
            where: {
                id: spaceId
            },
            include: {
                map: {
                    select: {
                        dropX: true,
                        dropY: true
                    }
                }
            }
        })

        res.status(200).json(new SuccessResponse('User profiles retrieved successfully', {
            avatar: userdata?.avatar?.imageUrl,
            nickname: userdata?.nickname,
            positionX: spaceData?.map.dropX,
            positionY: spaceData?.map.dropY
        }));
    } catch (error) {
        next(error);
    }
};
