import { addElementAdminSchema, addMapElementSchema, createAvtarSchema, createMapSchema } from "@repo/schematype";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { HttpStatusCode } from "axios";
import prisma from "../utils/prismaClient";


export const addElements = async (req:Request, res:Response, next:NextFunction)=>{
    try {
        const data = addElementAdminSchema.safeParse(req.body);
        if(!data.success){
            throw new AppError(HttpStatusCode.BadRequest,"Invalid element Data");
        }
        const element = data.data;
        const createdElement = await prisma.element.create({
            data:{
                name:element.name,
                imageUrl:element.imageUrl,
                static:element.static,
                height:element.height,
                width:element.width
            }
        })

        res.status(HttpStatusCode.Created).json(new SuccessResponse("Element created successfully",createdElement));
        
    } catch (error) {
        next(error);
    }
}


export const updateElement = async (req:Request,res:Response, next:NextFunction)=>{
    try {
        const updatedElement = await prisma.element.update({
            data:{
                imageUrl:req.body.imageUrl
            },
            where:{
                id:req.params.elementId
            }
        })

        res.status(HttpStatusCode.Ok).json(new SuccessResponse("Element updated successfully",updatedElement));
    } catch (error) {
        next(error);
    }
}


export const createAvatar = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const parsedData = createAvtarSchema.safeParse(req.body);
        if(!parsedData.success){
            throw new AppError(HttpStatusCode.BadRequest,"Invalid avatar Data");
        }
        const createdAvatar = await prisma.avatar.create({
            data:{
                name:parsedData.data.name,
                imageUrl:parsedData.data.imageUrl
            }
        })

        res.status(HttpStatusCode.Created).json(new SuccessResponse("Avatar created successfully",createdAvatar));
    } catch (error) {
        next(error);
    }
}


export const createMapController = async(req:Request, res:Response,next:NextFunction)=>{
    try {
        const parsedData = createMapSchema.safeParse(req.body);

        if(!parsedData.success){
            throw new AppError(HttpStatusCode.BadRequest,"Invalid Map Data");
        }
        const mapData = parsedData.data;

        const createdMap =await  prisma.map.create({
            data:{
                name:mapData.name,
                thumbnail:mapData.thumbnail,
                height:mapData.height,
                width:mapData.width
            }
        })

        res.status(HttpStatusCode.Created).json(new SuccessResponse("Map created Successfully",createdMap));
    } catch (error) {
        next(error);
    }
}


export const addMapElementsControllers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const parsedData = addMapElementSchema.safeParse(req.body);
        if (!parsedData.success) {
            throw new AppError(HttpStatusCode.BadRequest, "Invalid data input");
        }

        
        const mapExists = await prisma.map.findUnique({ where: { id: parsedData.data.mapId } });
        if (!mapExists) {
            throw new AppError(HttpStatusCode.BadRequest, `Map with ID ${parsedData.data.mapId} does not exist.`);
        }

        
        const mapElements = await Promise.all(
            parsedData.data.defaultElements.map(async (elem) => {
                
                const existingElement = await prisma.mapElement.findFirst({
                    where: {
                        mapId: parsedData.data.mapId,
                        x: elem.x,
                        y: elem.y
                    }
                });

                if (existingElement) {
                    
                    return {
                        success: false,
                        message: `An element already exists at coordinates (${elem.x}, ${elem.y})`,
                        element: elem
                    };
                }

                
                const newElement = await prisma.mapElement.create({
                    data: {
                        mapId: parsedData.data.mapId,
                        elementId: elem.elementId,
                        x: elem.x,
                        y: elem.y
                    }
                });

                return {
                    success: true,
                    message: 'Element created successfully',
                    element: newElement
                };
            })
        );

        
        res.status(HttpStatusCode.Ok).json(new SuccessResponse("Elements processed", mapElements));

    } catch (error) {
        next(error);  
    }
};
