import { NextFunction, Request, Response } from "express";
import prisma from "../utils/prismaClient";
import { HttpStatusCode } from "axios";
import { addELementSchema, userType } from "@repo/schematype";
import { AppError } from "../utils/AppError";


export const getArenaDetailsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const spaceId = req.params?.spaceId;
        const arenaDetail = prisma.space.findFirst({
            where: {
                id: spaceId
            },
            include: {
                elements: true,
            }
        })
        res.status(HttpStatusCode.Ok).json(new SuccessResponse("Arena details retrieved successfully", arenaDetail));
    }
    catch (error) {
        next(error);
    }
}


export const addElementsToArenaController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let element = addELementSchema.safeParse(req.body);
        const spaceId = req.params.spaceId;
        const userId = req.userId;
        if (!element.success) {
            throw new AppError(HttpStatusCode.BadRequest, "Invalid element Data");
        }
        const space = prisma.space.findFirst({
            where: {
                id: spaceId
            },
            include: {
                creator: {
                    select: {
                        id: true
                    }
                }
            }
        })

        const creator = space?.creator as userType | null;
        if (!space || !space.creator) {
            throw new AppError(HttpStatusCode.BadRequest, 'No such space with that space id');
        }
        if (creator?.id !== userId) {
            throw new AppError(HttpStatusCode.Forbidden, 'You are not the creator of this space');
        }
        const spaceElement = await prisma.spaceElement.create({
            data: {
                spaceId: spaceId,
                x: element.data.x,
                y: element.data.y,
                elementId: element.data.elementId
            }
        })

        res.status(HttpStatusCode.Created).json(new SuccessResponse('Element added to arena successfully', spaceElement));

    } catch (error) {
        next(error)

    }
}


export const RemoveElementController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const spaceId = req.params.spaceId;
        const elementId = req.params.elementId;
        const userId = req.userId;

        const space = prisma.space.findFirst({
            where: {
                id: spaceId
            },
            include: {
                creator: {
                    select: {
                        id: true
                    }
                }
            }
        })

        const creator = space?.creator as userType | null;
        if (!space || !space.creator) {
            throw new AppError(HttpStatusCode.BadRequest, 'No such space with that space id');
        }
        if (creator?.id !== userId) {
            throw new AppError(HttpStatusCode.Forbidden, 'You are not the creator of this space');
        }

        const elementDeleted = prisma.spaceElement.delete({
            where: {
                id: elementId
            }
        })

        res.status(HttpStatusCode.NoContent).json(new SuccessResponse("ELement Created Successfully",elementDeleted));
    } catch (error) {
        next(error);
    }
}



export const GetAvailableElementsController = async(req:Request, res:Response, next:NextFunction)=>{
try {
    const spaceId = req.params.spaceId;

    if(!spaceId){
        throw new AppError(HttpStatusCode.BadRequest,"No space found")
    }
    const elements = prisma.spaceElement.findMany({
        where:{
            spaceId:spaceId
        },
        include:{
            element:true
        }
    })
} catch (error) {
    next(error)
}
}