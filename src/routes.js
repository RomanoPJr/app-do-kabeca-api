import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import EventSuggestionController from './app/controllers/EventSuggestionController';
import StatuteSuggestionController from './app/controllers/StatuteSuggestionController';

const routes = new Router();
routes.post('/sessions', SessionController.store);

/*
 * Before here routes NOT require auth
 */

routes.use(authMiddleware);

/*
 * After here routes require auth
 */
routes.get('/sessions', SessionController.index);

routes.get('/user', UserController.index);
routes.post('/user', UserController.store);
routes.put('/user', UserController.update);
routes.delete('/user/:id', UserController.delete);

routes.get('/event_suggestion', EventSuggestionController.index);
routes.post('/event_suggestion', EventSuggestionController.store);
routes.put('/event_suggestion', EventSuggestionController.update);
routes.delete('/event_suggestion/:id', EventSuggestionController.delete);

routes.get('/statute_suggestion', StatuteSuggestionController.index);
routes.post('/statute_suggestion', StatuteSuggestionController.store);
routes.put('/statute_suggestion', StatuteSuggestionController.update);
routes.delete('/statute_suggestion/:id', StatuteSuggestionController.delete);

export default routes;
