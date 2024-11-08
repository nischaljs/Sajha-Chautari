import express from 'express'
import authmiddleware from '../middlewares/authmiddleware';
import { createSpaceRouter, deleteSpace,getUserSpaces } from '../controllers/space.controller';

const spaceRouter = express.Router();

spaceRouter.use(authmiddleware());

spaceRouter.post('/',createSpaceRouter);
spaceRouter.delete('/',deleteSpace);
spaceRouter.get('/',getUserSpaces);

export default spaceRouter;