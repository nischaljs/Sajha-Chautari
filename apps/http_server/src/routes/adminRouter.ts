import express, { NextFunction, Request, Response } from "express";
import authmiddleware, { role } from "../middlewares/authmiddleware";
import { AppError } from "../utils/AppError";
import { HttpStatusCode } from "axios";
import {
  addMapElementsControllers,
  createAvatar,
  createMapController,
  updateElement,
} from "../controllers/admin.controller";

const adminRouter = express.Router();

adminRouter.use(authmiddleware());
adminRouter.use((req: Request, res: Response, next: NextFunction) => {
  if (req.userRole != role.Admin)
    throw new AppError(
      HttpStatusCode.Unauthorized,
      "You are not authorized to access this route",
    );
});

adminRouter.post("/elements");

adminRouter.put("/:elementId", updateElement);

adminRouter.post("/avatars", createAvatar);

adminRouter.post("/maps", createMapController);

adminRouter.post("/map/element", addMapElementsControllers);

export default adminRouter;
