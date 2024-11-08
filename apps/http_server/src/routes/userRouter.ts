import express from 'express';
import authmiddleware from '../middlewares/authmiddleware';
import { getAvatarsController, getMultipleUsersProfileController, profileUpdateController } from '../controllers/user.controllers';

const userRouter = express.Router();

userRouter.use(authmiddleware());

userRouter.put('/profile',profileUpdateController);

userRouter.get('/avatars',getAvatarsController);

userRouter.get('/profiles',getMultipleUsersProfileController)



export default userRouter;