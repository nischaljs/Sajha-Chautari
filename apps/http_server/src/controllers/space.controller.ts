import { createSpaceSchema } from "@repo/schematype";
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { SuccessResponse } from "../utils/SuccessResponse";
import prisma from "../utils/prismaClient";

export const createSpaceRouter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

    res
      .status(HttpStatusCode.Created)
      .json(new SuccessResponse("Virtual space created successfully", space));
  } catch (error) {
    next(error);
  }
};

export const deleteSpace = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spaceId: string = req.params.id;

    await prisma.space.delete({
      where: {
        id: spaceId,
      },
    });

    res
      .status(HttpStatusCode.NoContent)
      .json(new SuccessResponse("Space Deleted", {}));
  } catch (error) {
    next(error);
  }
};

export const getUserSpaces = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userSpaces = await prisma.space.findMany({
      where: {
        OR: [
          { creatorId: req.userId },
          { users: { some: { id: req.userId } } },
        ],
      },
      include: {

        creator: {
          select: {
            id: true,
            email: true,
            nickname: true,
          },
        },
        map: {
          select: {
            thumbnail: true,
          },
        },
        users: {
          select: {
            id: true,
            nickname: true,
            avatarId: true,
          },
        },
      },
    });


    res
      .status(HttpStatusCode.Ok)
      .json(
        new SuccessResponse(
          "User's virtual spaces retrieved successfully",
          userSpaces
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const joinSpaceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spaceId = req.body.spaceId;
    const userId = req.userId;


    const userresponse = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        spaces: true,
      },
    });

    if (!userresponse) {
      throw new AppError(HttpStatusCode.BadRequest, "User is unknown");
    }

    const spaceResponse = await prisma.space.findUnique({
      where: {
        id: spaceId,
      },
      include:{
        map:true
      }
    });

    if (!spaceResponse) {
      throw new AppError(HttpStatusCode.BadRequest, "No space found");
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        spaces: {
          connect: { id: spaceId },
        },
      },
      select:{
        id:true,
        email:true,
        password:true,
        nickname:true,
        avatar:true
      }
    });

    res
      .status(HttpStatusCode.Ok)
      .json(new SuccessResponse("user entered the space", {user, spaceResponse}));
  } catch (error) {
    next(error);
  }
};


export const getAllMaps = async(req:Request, res:Response, next:NextFunction) =>{
  try {
    const AllMaps = await prisma.map.findMany();
    res.status(HttpStatusCode.Ok).json(new SuccessResponse("all maps retrieved", AllMaps));
  } catch (error) {
    next(error);
  }
}
