import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';
import UserController from './app/controllers/UserController';
import ClubController from './app/controllers/ClubController';
import EventController from './app/controllers/EventController';
import SessionController from './app/controllers/SessionController';
import SponsorController from './app/controllers/SponsorController';
import OrganizerController from './app/controllers/OrganizerController';
import EventSuggestionController from './app/controllers/EventSuggestionController';
import StatuteSuggestionController from './app/controllers/StatuteSuggestionController';

const routes = new Router();
routes.post('/sessions', SessionController.store);
routes.post('/organizer', OrganizerController.store);

/*
 * Before here routes NOT require auth
 */

routes.use(authMiddleware);

/*
 * After here routes require auth
 */
routes.get('/sessions', SessionController.index);

routes.get('/club', ClubController.index);
routes.post('/club', ClubController.store);
routes.put('/club', ClubController.update);
routes.delete('/club/:id', ClubController.delete);

routes.get('/user', UserController.index);
routes.post('/user', UserController.store);
routes.put('/user', UserController.update);
routes.delete('/user/:id', UserController.delete);

routes.get('/event', EventController.index);
routes.post('/event', EventController.store);
routes.put('/event', EventController.update);
routes.delete('/event/:id', EventController.delete);

routes.get('/sponsor', SponsorController.index);
routes.post('/sponsor', SponsorController.store);
routes.put('/sponsor', SponsorController.update);
routes.delete('/sponsor/:id', SponsorController.delete);

routes.get('/organizer', OrganizerController.index);
routes.put('/organizer', OrganizerController.update);
routes.delete('/organizer', OrganizerController.delete);

routes.get('/event_suggestion', EventSuggestionController.index);
routes.post('/event_suggestion', EventSuggestionController.store);
routes.put('/event_suggestion', EventSuggestionController.update);
routes.delete('/event_suggestion/:id', EventSuggestionController.delete);

routes.get('/statute_suggestion', StatuteSuggestionController.index);
routes.post('/statute_suggestion', StatuteSuggestionController.store);
routes.put('/statute_suggestion', StatuteSuggestionController.update);
routes.delete('/statute_suggestion/:id', StatuteSuggestionController.delete);

export default routes;
