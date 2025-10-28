import e from 'express';
import { ClientController } from '../../modules/client/client.controller.js';
import { wrapHandler } from '../../utils/wrap-handler.js';
import { privateRoute } from '../middlewares/auth/private-route.js';

export const ClientRouter = e.Router();

ClientRouter.post('/token', wrapHandler(ClientController.getToken));

ClientRouter.get('/userinfo', wrapHandler(ClientController.getUserInfo));

ClientRouter.use(privateRoute);

ClientRouter.get('/', wrapHandler(ClientController.getApps));

ClientRouter.get('/apps/create', wrapHandler(ClientController.createAppPage));
ClientRouter.post('/apps/create', wrapHandler(ClientController.createApp));

ClientRouter.get('/authorize', wrapHandler(ClientController.authorizePage));

ClientRouter.post('/approve', wrapHandler(ClientController.approve));
