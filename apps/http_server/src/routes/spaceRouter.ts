import express from 'express'
import authmiddleware from '../middlewares/authmiddleware';
import { createSpaceRouter, deleteSpace,getUserSpaces, joinSpaceController } from '../controllers/space.controller';

const spaceRouter = express.Router();

spaceRouter.use(authmiddleware());

spaceRouter.post('/',createSpaceRouter);
spaceRouter.delete('/',deleteSpace);
spaceRouter.get('/',getUserSpaces);
spaceRouter.post('/join-space',joinSpaceController);

export default spaceRouter;