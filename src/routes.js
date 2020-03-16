import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';
import AdminController from './app/controllers/AdminController';
import SessionController from './app/controllers/SessionController';
import OrganizerController from './app/controllers/OrganizerController';
import EventSuggestionController from './app/controllers/EventSuggestionController';
import StatuteSuggestionController from './app/controllers/StatuteSuggestionController';

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

routes.get('/event_suggestion', EventSuggestionController.index);
routes.post('/event_suggestion', EventSuggestionController.store);
routes.put('/event_suggestion', EventSuggestionController.update);
routes.delete('/event_suggestion/:id', EventSuggestionController.delete);

routes.get('/organizer', OrganizerController.index);
routes.post('/organizer', OrganizerController.store);
routes.put('/organizer', OrganizerController.update);
routes.delete('/organizer/:id', OrganizerController.delete);

export default routes;
