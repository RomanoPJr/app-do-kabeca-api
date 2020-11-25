import authAdmin from '../app/middlewares/authAdmin';
import AdminController from '../app/controllers/AdminController';
import SessionController from '../app/controllers/SessionController';
import OrganizerController from '../app/controllers/OrganizerController';
import SuggestionEventController from '../app/controllers/SuggestionEventController';

export default routes => {
  routes.use(authAdmin);

  routes.post('/sessions/external', SessionController.storeAdmin);

  routes.get('/admin', AdminController.index);
  routes.post('/admin', AdminController.store);
  routes.put('/admin', AdminController.update);
  routes.delete('/admin/:id', AdminController.delete);

  routes.get('/organizer', OrganizerController.index);
  routes.put('/organizer', OrganizerController.update);
  routes.delete('/organizer', OrganizerController.delete);

  routes.get('/suggestion_event', SuggestionEventController.index);
  routes.post('/suggestion_event', SuggestionEventController.store);
  routes.put('/suggestion_event', SuggestionEventController.update);
  routes.delete('/suggestion_event/:id', SuggestionEventController.delete);
};
