import { Router } from 'express';

import AdminController from './app/controllers/AdminController';
import StatuteSuggestionController from './app/controllers/StatuteSuggestionController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/admins', AdminController.store);
routes.post('/sessions', SessionController.store);

/*
 * Before here routes NOT require auth
 */

routes.use(authMiddleware);

/*
 * After here routes require auth
 */

routes.get('/admins', AdminController.index);
routes.put('/admins', AdminController.update);
routes.delete('/admins/:id', AdminController.delete);

routes.get('/statute_suggestion', StatuteSuggestionController.index);
routes.post('/statute_suggestion', StatuteSuggestionController.store);
routes.put('/statute_suggestion', StatuteSuggestionController.update);
routes.delete('/statute_suggestion/:id', StatuteSuggestionController.delete);

export default routes;
