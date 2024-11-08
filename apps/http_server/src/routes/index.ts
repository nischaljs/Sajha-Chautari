import express from 'express'
import authRouter from './authRouter';
import userRouter from './userRouter';
import spaceRouter from './spaceRouter';
import arenaRouter from './arenaRouter';
import adminRouter from './adminRouter';

const mainRouter = express.Router();

mainRouter.use('/auth',authRouter);
mainRouter.use('/user',userRouter);
mainRouter.use('/spaces',spaceRouter);
mainRouter.use('/arenas',arenaRouter);
mainRouter.use('/admin',adminRouter);

export default mainRouter;