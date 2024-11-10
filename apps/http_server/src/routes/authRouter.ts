import express from 'express'
import { loginController, registerController, tokenVerifierController } from '../controllers/auth.controller';
import authmiddleware from '../middlewares/authmiddleware';

const authRouter = express.Router();

authRouter.post('/register',registerController);
authRouter.post('/login',loginController);
authRouter.get('/valid-token',authmiddleware(),tokenVerifierController)

export default authRouter;