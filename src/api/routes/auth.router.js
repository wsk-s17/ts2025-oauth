import e from 'express';
import { AuthController } from '../../modules/auth/auth.controller.js';
import { wrapHandler } from '../../utils/wrap-handler.js';
import { privateRoute } from '../middlewares/auth/private-route.js';

export const AuthRouter = e.Router();

AuthRouter.use(privateRoute);

AuthRouter.get('/login', wrapHandler(AuthController.loginPage));
AuthRouter.post('/login', wrapHandler(AuthController.login));

AuthRouter.get('/register', wrapHandler(AuthController.registerPage));
AuthRouter.post('/register', wrapHandler(AuthController.register));

AuthRouter.post('/logout', wrapHandler(AuthController.logout));
