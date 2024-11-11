import express from "express";
import {
  createSpaceRouter,
  deleteSpace,
  getUserSpaces,
  joinSpaceController,
} from "../controllers/space.controller";
import authmiddleware from "../middlewares/authmiddleware";

const spaceRouter = express.Router();

spaceRouter.use(authmiddleware());

spaceRouter.post("/", createSpaceRouter);
spaceRouter.delete("/", deleteSpace);
spaceRouter.get("/", getUserSpaces);
spaceRouter.post("/join-space", joinSpaceController);

export default spaceRouter;
