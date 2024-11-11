import express from "express";
import adminRouter from "./adminRouter";
import arenaRouter from "./arenaRouter";
import authRouter from "./authRouter";
import spaceRouter from "./spaceRouter";
import userRouter from "./userRouter";

const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/user", userRouter);
mainRouter.use("/spaces", spaceRouter);
mainRouter.use("/arenas", arenaRouter);
mainRouter.use("/admin", adminRouter);

export default mainRouter;
