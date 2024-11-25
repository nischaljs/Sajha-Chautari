import express, { NextFunction, Request, Response } from "express";
import authmiddleware, { role } from "../middlewares/authmiddleware";
import { AppError } from "../utils/AppError";
import { HttpStatusCode } from "axios";
import {
  addElements,
  addMapElementsController,
  createAvatar,
  createMapController,
  updateElement,
  getMapDetailsController
} from "../controllers/admin.controller";
import upload from "../middlewares/multerMiddleware";

const adminRouter = express.Router();

adminRouter.use(authmiddleware());
adminRouter.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.userRole || String(req.userRole) !== role[role.Admin]) {
    throw new AppError(
      HttpStatusCode.Unauthorized,
      "You are not authorized to access this route",
    );
  } else {
    next();
  }
});


adminRouter.post("/elements",upload.single("imageFile"),addElements);

adminRouter.put("/:elementId", updateElement);


adminRouter.get("/maps/:mapId",getMapDetailsController);

adminRouter.post("/avatars", upload.single("avatars"), createAvatar);

adminRouter.post("/maps",upload.single("thumbnail"), createMapController);

adminRouter.post("/map/element", addMapElementsController);

export default adminRouter;
