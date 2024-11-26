import {
  addElementAdminSchema,
  addMapElementSchema,
  createAvtarSchema,
  createMapSchema,
} from "@repo/schematype";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { SuccessResponse } from "../utils/SuccessResponse";
import { HttpStatusCode } from "axios";
import prisma from "../utils/prismaClient";

export const addElements = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = addElementAdminSchema.safeParse(req.body);
    if (!data.success) {
      throw new AppError(HttpStatusCode.BadRequest, "Invalid element Data");
    }
    const element = data.data;
    const createdElement = await prisma.element.create({
      data: {
        name: element.name,
        imageUrl: req.file?.filename || '',
        static: element.static,
        height: element.height,
        width: element.width,
      },
    });

    res
      .status(HttpStatusCode.Created)
      .json(
        new SuccessResponse("Element created successfully", createdElement),
      );
  } catch (error) {
    next(error);
  }
};

export const updateElement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedElement = await prisma.element.update({
      data: {
        imageUrl: req.body.imageUrl,
      },
      where: {
        id: req.params.elementId,
      },
    });

    res
      .status(HttpStatusCode.Ok)
      .json(
        new SuccessResponse("Element updated successfully", updatedElement),
      );
  } catch (error) {
    next(error);
  }
};

export const createAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedData = createAvtarSchema.safeParse(req.body);
    if (!parsedData.success) {
      throw new AppError(HttpStatusCode.BadRequest, "Invalid avatar Data");
    }
    if(!req.file?.filename){
      throw new AppError(HttpStatusCode.InternalServerError,"Couldnot upload the avat image");
    }
    const createdAvatar = await prisma.avatar.create({
      data: {
        name: parsedData.data.name,
        imageUrl: req.file?.filename || '',
      },
    });

    res
      .status(HttpStatusCode.Created)
      .json(new SuccessResponse("Avatar created successfully", createdAvatar));
  } catch (error) {
    next(error);
  }
};

export const createMapController = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const parsedData = createMapSchema.safeParse(req.body);

    if (!parsedData.success) {
      throw new AppError(HttpStatusCode.BadRequest, "Invalid Map Data");
    }
    const mapData = parsedData.data;

    const createdMap = await prisma.map.create({
      data: {
        name: mapData.name,
        thumbnail: req.file?.filename || '', // Use file path
        height: mapData.height,
        width: mapData.width,
        dropX: Math.floor(mapData.width / 2),   // Centered drop point
        dropY: Math.floor(mapData.height / 2),
      },
    });

    res
      .status(HttpStatusCode.Created)
      .json(new SuccessResponse("Map created Successfully", {
        map: createdMap,
        dropPoint: { x: createdMap.dropX, y: createdMap.dropY }
      }));
  } catch (error) {
    next(error);
  }
};

export const addMapElementsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Validate input data
    const parsedData = addMapElementSchema.safeParse(req.body);
    if (!parsedData.success) {
      throw new AppError(HttpStatusCode.BadRequest, "Invalid data input");
    }

    const { mapId, defaultElements } = parsedData.data;

    // Check if the map exists
    const mapExists = await prisma.map.findUnique({
      where: { id: mapId },
    });

    if (!mapExists) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Map with ID ${mapId} does not exist.`,
      );
    }

    // Clear existing elements for the map
    await prisma.mapElement.deleteMany({
      where: { mapId },
    });

    // Add new elements to the map
    const createdElements = await prisma.$transaction(
      defaultElements.map(elem =>
        prisma.mapElement.create({
          data: {
            mapId,
            elementId: elem.elementId,
            x: elem.x,
            y: elem.y,
          },
        }),
      ),
    );

    // Send success response
    res
      .status(HttpStatusCode.Ok)
      .json(new SuccessResponse("Elements successfully updated", createdElements));
  } catch (error) {
    next(error);
  }
};


export const getMapDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const mapId = req.params.mapId;

    // Fetch map details with associated map elements
    const mapDetails = await prisma.map.findUnique({
      where: { id: mapId },
      include: {
        mapElements: {
          include: {
            element: true // Include full element details
          }
        }
      }
    });

    if (!mapDetails) {
      throw new AppError(HttpStatusCode.NotFound, "Map not found");
    }

    // Transform map elements to match frontend structure
    const mappedElements = mapDetails.mapElements.map(mapElement => ({
      ...mapElement.element,
      position: { x: mapElement.x, y: mapElement.y },
      canvasId: mapElement.id // Use map element ID as canvas ID
    }));

    res.status(HttpStatusCode.Ok).json(new SuccessResponse("Map details retrieved", {
      map: mapDetails,
      elements: mappedElements
    }));
  } catch (error) {
    next(error);
  }
};