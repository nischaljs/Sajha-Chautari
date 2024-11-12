import express from "express";
import {
  getAvatarsController,
  getUserProfile,
  profileUpdateController,
  getLoggedUser
} from "../controllers/user.controller";
import authmiddleware from "../middlewares/authmiddleware";

const userRouter = express.Router();

userRouter.use(authmiddleware());
userRouter.get('/', getLoggedUser)

userRouter.put("/profile", profileUpdateController);

userRouter.get("/avatars", getAvatarsController);


userRouter.get("/profiles", getUserProfile);

export default userRouter;
