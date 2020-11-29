import authAdmin from '../app/middlewares/authAdmin';
import AdminController from '../app/controllers/AdminController';
import SessionController from '../app/controllers/SessionController';
import OrganizerController from '../app/controllers/OrganizerController';
import SuggestionStatuteController from '../app/controllers/SuggestionStatuteController';

export default routes => {
  routes.use(authAdmin);

  routes.post('/sessions/external', SessionController.storeAdmin);

  routes.get('/admin/admin', AdminController.index);
  routes.post('/admin/admin', AdminController.store);
  routes.put('/admin/admin', AdminController.update);
  routes.delete('/admin/admin/:id', AdminController.delete);

  routes.get('/admin/organizer', OrganizerController.index);
  routes.put('/admin/organizer', OrganizerController.update);
  routes.delete('/admin/organizer', OrganizerController.delete);

  routes.get('/admin/suggestion_statute', SuggestionStatuteController.index);
  routes.put('/admin/suggestion_statute', SuggestionStatuteController.update);
  routes.post('/admin/suggestion_statute', SuggestionStatuteController.store);
  routes.delete('/admin/suggestion_statute/:id', SuggestionStatuteController.delete);
};
