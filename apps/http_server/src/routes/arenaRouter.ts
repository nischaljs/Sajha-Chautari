import express from "express";
import authmiddleware from "../middlewares/authmiddleware";
import {
  addElementsToArenaController,
  checkPositionController,
  getArenaDetailsController,
  GetAvailableElementsController,
} from "../controllers/arena .controller";

const arenaRouter = express.Router();

arenaRouter.use(authmiddleware());

arenaRouter.get("/elements", GetAvailableElementsController);

arenaRouter.get("/:spaceId", getArenaDetailsController);

arenaRouter.post("/:spaceId/elements", addElementsToArenaController);

arenaRouter.delete("/:spaceId/elements/:elementId");

arenaRouter.get("/check-position", checkPositionController);

export default arenaRouter;
