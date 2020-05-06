import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';
import authAdmin from './app/middlewares/authAdmin';
import authOrganizer from './app/middlewares/authOrganizer';
import ClubController from './app/controllers/ClubController';
import UserController from './app/controllers/UserController';
import AdminController from './app/controllers/AdminController';
import EventController from './app/controllers/EventController';
import PlayerController from './app/controllers/PlayerController';
import SessionController from './app/controllers/SessionController';
import PaymentController from './app/controllers/PaymentController';
import SponsorController from './app/controllers/SponsorController';
import StatuteController from './app/controllers/StatuteController';
import OrganizerController from './app/controllers/OrganizerController';
import SuggestionEventController from './app/controllers/SuggestionEventController';
import SuggestionStatuteController from './app/controllers/SuggestionStatuteController';

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

// FREE ROUTES

routes.get('/sessions', SessionController.index);
routes.get('/suggestion_event/all', SuggestionEventController.all);

// ADMIN ROUTES

routes.get('/admin', authAdmin, AdminController.index);
routes.post('/admin', authAdmin, AdminController.store);
routes.put('/admin', authAdmin, AdminController.update);
routes.delete('/admin/:id', authAdmin, AdminController.delete);

routes.get('/organizer', authAdmin, OrganizerController.index);
routes.put('/organizer', authAdmin, OrganizerController.update);
routes.delete('/organizer', authAdmin, OrganizerController.delete);

routes.get('/suggestion_event', authAdmin, SuggestionEventController.index);
routes.post('/suggestion_event', authAdmin, SuggestionEventController.store);
routes.put('/suggestion_event', authAdmin, SuggestionEventController.update);
routes.delete(
  '/suggestion_event/:id',
  authAdmin,
  SuggestionEventController.delete
);

routes.get('/suggestion_statute', SuggestionStatuteController.index);
routes.post('/suggestion_statute', SuggestionStatuteController.store);
routes.put('/suggestion_statute', SuggestionStatuteController.update);
routes.delete('/suggestion_statute/:id', SuggestionStatuteController.delete);

// ORGANIZER ROUTES

routes.get('/club', authOrganizer, ClubController.index);
routes.post('/club', authOrganizer, ClubController.store);
routes.put('/club', authOrganizer, ClubController.update);
routes.delete('/club/:id', authOrganizer, ClubController.delete);

routes.get('/event', authOrganizer, EventController.index);
routes.post('/event', authOrganizer, EventController.store);
routes.put('/event', authOrganizer, EventController.update);
routes.delete('/event/:id', authOrganizer, EventController.delete);

routes.get('/player', authOrganizer, PlayerController.index);
routes.post('/player', authOrganizer, PlayerController.store);
routes.put('/player', authOrganizer, PlayerController.update);
routes.delete('/player/:id', authOrganizer, PlayerController.delete);
routes.put(
  '/player/:id/reset_password',
  authOrganizer,
  PlayerController.resetPassword
);

routes.get('/sponsor', authOrganizer, SponsorController.index);
routes.post('/sponsor', authOrganizer, SponsorController.store);
routes.put('/sponsor', authOrganizer, SponsorController.update);
routes.delete('/sponsor/:id', authOrganizer, SponsorController.delete);

routes.get('/statute', authOrganizer, StatuteController.index);
routes.post('/statute', authOrganizer, StatuteController.store);
routes.put('/statute', authOrganizer, StatuteController.update);
routes.delete('/statute/:id', authOrganizer, StatuteController.delete);

routes.get('/user', authOrganizer, UserController.index);
routes.get('/user/find', authOrganizer, UserController.findOne);

routes.get('/payment', authOrganizer, PaymentController.index);
routes.post('/payment', authOrganizer, PaymentController.store);
routes.put('/payment', authOrganizer, PaymentController.update);
routes.delete('/payment/:id', authOrganizer, PaymentController.delete);

export default routes;
