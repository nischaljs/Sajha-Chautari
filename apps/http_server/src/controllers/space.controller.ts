import { createSpaceSchema } from "@repo/schematype";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import prisma from "../utils/prismaClient";


export const createSpaceRouter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedData = createSpaceSchema.safeParse(req.body);

       
        if (!parsedData.success) {
            throw new AppError(HttpStatusCode.BadRequest, "Invalid request data");
        }

        const map = await prisma.map.findUnique({
            where: {
                id: parsedData.data.mapId,
            },
        });

        if (!map) {
            throw new AppError(HttpStatusCode.BadRequest, "No such map exists");
        }

        const space = await prisma.space.create({
            data: {
                name: parsedData.data.name,
                mapId: parsedData.data.mapId,
                capacity: parsedData.data.capacity,
                creatorId: req.userId!,
            },
        });

         res.status(HttpStatusCode.Created).json(new SuccessResponse('Virtual space created successfully',space));
    } catch (error) {
        next(error);
    }
};


export const deleteSpace = async (req:Request, res:Response, next:NextFunction) =>{
try {
    const spaceId:string = req.params.id;

    await prisma.space.delete({
        where:{
            id:spaceId
        }
    })

    res.status(HttpStatusCode.NoContent).json(new SuccessResponse("Space Deleted",{}))
} catch (error) {
    next(error);
}
}


export const getUserSpaces = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const userSpaces = await prisma.user.findMany({
            where:{
                id:req.userId
            },
            include:{
                spaces:{
                    select:{
                    id:true,
                    name:true,
                    capacity:true,
                    },
                    include:{
                        map:{
                            select:{
                                thumbnail:true
                            }
                        }
                    }
                }
            }
        })
        res.status(HttpStatusCode.Ok).json(new SuccessResponse("User's virtual spaces retrieved successfully",userSpaces));
    } catch (error) {
        next(error);
    }
}
