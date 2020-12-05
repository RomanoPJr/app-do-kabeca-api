import { Router } from 'express';

import auth from './middlewares/auth';
import adminRoutes from './adminRoutes';

import usersRoutes from './usersRoutes';
import authMiddleware from '../app/middlewares/authMiddleware';
import SessionController from '../app/controllers/SessionController';
import OrganizerController from '../app/controllers/OrganizerController';
import UserController from '../app/controllers/UserController';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.post('/organizer', OrganizerController.store);
routes.post('/sessions/criar-senha', UserController.storeSenha);

routes.use(auth);

routes.get('/sessions', SessionController.index);

routes.use('/admin', (req, res, next) => {
  adminRoutes(routes);
  next();
});

routes.use(authMiddleware);
usersRoutes(routes);

export default routes;
