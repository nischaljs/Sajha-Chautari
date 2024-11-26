import { NextFunction, Request, Response } from "express";
import prisma from "../utils/prismaClient";
import { HttpStatusCode } from "axios";
import { addELementSchema, userType } from "@repo/schematype";
import { SuccessResponse } from "../utils/SuccessResponse";
import { AppError } from "../utils/AppError";

export const getArenaDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const spaceId = req.params?.spaceId;
    const arenaDetail = await prisma.space.findFirst({
      where: {
        id: spaceId,
      },
      include: {
        // Include space elements with their full element details
        elements: {
          include: {
            element: {
              select: {
                id: true,
                name: true,
                width: true,
                height: true,
                imageUrl: true,
                static: true,
              }
            }
          }
        },
        // Include map with its elements
        map: {
          include: {
            mapElements: {
              include: {
                element: {
                  select: {
                    id: true,
                    name: true,
                    width: true,
                    height: true,
                    imageUrl: true,
                    static: true,
                  }
                }
              }
            }
          }
        },
        // Include creator details
        creator: {
          select: {
            id: true,
            nickname: true,
            avatarId: true,
            role: true,
          }
        },
        // Include connected users with their avatars
        users: {
          include: {
            avatar: {
              select: {
                id: true,
                imageUrl: true,
                name: true,
              },
            },
          },
        },
      },
    });


    res
      .status(HttpStatusCode.Ok)
      .json(
        new SuccessResponse(
          "Arena details retrieved successfully",
          arenaDetail,
        ),
      );
  } catch (error) {
    next(error);
  }
};


export const addElementsToArenaController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let element = addELementSchema.safeParse(req.body);
    const spaceId = req.params.spaceId;
    const userId = req.userId;
    if (!element.success) {
      throw new AppError(HttpStatusCode.BadRequest, "Invalid element Data");
    }
    const space = await prisma.space.findFirst({
      where: {
        id: spaceId,
      },
      include: {
        creator: {
          select: {
            id: true,
          },
        },
        map: {
          include: {
            mapElements: true,
          },
        },
        elements: true,
      },
    });

    const creator = space?.creator as userType | null;
    if (!space || !space.creator) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "No such space with that space id",
      );
    }
    if (creator?.id !== userId) {
      throw new AppError(
        HttpStatusCode.Forbidden,
        "You are not the creator of this space",
      );
    }

    const isPositionOccupied = [
      ...space.map.mapElements,
      ...space.elements,
    ].some((elem) => elem.x === element.data.x && elem.y === element.data.y);

    if (isPositionOccupied) {
      throw new AppError(
        HttpStatusCode.Conflict,
        `An element already exists at coordinates (${element.data.x}, ${element.data.y})`,
      );
    }

    const spaceElement = await prisma.spaceElement.create({
      data: {
        spaceId: spaceId,
        x: element.data.x,
        y: element.data.y,
        elementId: element.data.elementId,
      },
    });

    res
      .status(HttpStatusCode.Created)
      .json(
        new SuccessResponse(
          "Element added to arena successfully",
          spaceElement,
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const RemoveElementController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spaceId = req.params.spaceId;
    const elementId = req.params.elementId;
    const userId = req.userId;

    const space = await prisma.space.findFirst({
      where: {
        id: spaceId,
      },
      include: {
        creator: {
          select: {
            id: true,
          },
        },
      },
    });

    const creator = space?.creator as userType | null;
    if (!space || !space.creator) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "No such space with that space id",
      );
    }
    if (creator?.id !== userId) {
      throw new AppError(
        HttpStatusCode.Forbidden,
        "You are not the creator of this space",
      );
    }

    const elementDeleted = await prisma.spaceElement.delete({
      where: {
        id: elementId,
      },
    });

    res
      .status(HttpStatusCode.NoContent)
      .json(
        new SuccessResponse("ELement Created Successfully", elementDeleted),
      );
  } catch (error) {
    next(error);
  }
};

export const GetAvailableElementsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spaceId = req.params.spaceId;

    if (!spaceId) {
      throw new AppError(HttpStatusCode.BadRequest, "No space found");
    }
    const elements = await prisma.spaceElement.findMany({
      where: {
        spaceId: spaceId,
      },
      include: {
        element: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkPositionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const x = req.query.x ? parseInt(req.query.x as string) : NaN;
    const y = req.query.y ? parseInt(req.query.y as string) : NaN;
    const width = req.query.width ? parseInt(req.query.width as string) : 1;
    const height = req.query.height ? parseInt(req.query.height as string) : 1;
    const spaceId = req.body.spaceId;

    const space = await prisma.space.findFirst({
      where: { id: spaceId },
      include: {
        map: {
          include: {
            mapElements: {
              include: { element: true },
            },
          },
        },
        elements: { include: { element: true } },
      },
    });

    if (!space) {
      throw new AppError(HttpStatusCode.BadRequest, "Such space doesn't exist");
    }

    let isPositionOccupied = [...space.map.mapElements, ...space.elements].some(
      (elem) => {
        const elemRight = elem.x + elem.element.width;
        const elemBottom = elem.y + elem.element.height;
        const newRight = x + width;
        const newBottom = y + height;

        return (
          x < elemRight &&
          newRight > elem.x &&
          y < elemBottom &&
          newBottom > elem.y
        );
      },
    );

    res
      .status(HttpStatusCode.Ok)
      .json(
        new SuccessResponse("Position detail obtained", isPositionOccupied),
      );
  } catch (error) {
    next(error);
  }
};
