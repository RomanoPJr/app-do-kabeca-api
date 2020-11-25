import { Router } from 'express';
import Sequelize from 'sequelize';

import decode from '../utils/token';
import User from '../app/models/User';
// import adminRoutes from './adminRoutes';

import authMiddleware from '../app/middlewares/authMiddleware';
import ClubController from '../app/controllers/ClubController';
import UserController from '../app/controllers/UserController';
import EventController from '../app/controllers/EventController';
import MatchController from '../app/controllers/MatchController';
import PlayerController from '../app/controllers/PlayerController';
import ReportController from '../app/controllers/ReportController';
import SponsorController from '../app/controllers/SponsorController';
import StatuteController from '../app/controllers/StatuteController';
import SessionController from '../app/controllers/SessionController';
import OrganizerController from '../app/controllers/OrganizerController';
import MatchEventController from '../app/controllers/MatchEventController';
import EscalationController from '../app/controllers/MatchEscalationController';
import MonthlyPaymentController from '../app/controllers/MonthlyPaymentController';
import SuggestionEventController from '../app/controllers/SuggestionEventController';
import SuggestionStatuteController from '../app/controllers/SuggestionStatuteController';

const routes = new Router();
routes.post('/sessions', SessionController.store);
routes.post('/organizer', OrganizerController.store);

routes.use(async (req, res, next) => {
  const decodedToken = await decode(req.headers, res);

  const dataFindOneUser = await User.findOne({
    where: Sequelize.or({ id: decodedToken.id }),
  });

  if (!dataFindOneUser) {
    return res.status(401).json({
      error: 'Você não possui permissão para executar essa ação',
    });
  }

  const userData = dataFindOneUser.toJSON();
  req.body.user_request = userData;
  return next();
});

// adminRoutes(routes);

routes.get('/suggestion_event/all', SuggestionEventController.all);
routes.get('/suggestion_statute', SuggestionStatuteController.index);
routes.put('/suggestion_statute', SuggestionStatuteController.update);
routes.post('/suggestion_statute', SuggestionStatuteController.store);
routes.delete('/suggestion_statute/:id', SuggestionStatuteController.delete);

routes.get('/sessions', SessionController.index);

//
//
//  AUTH MIDDLEWARE
//
//

routes.use(authMiddleware);

routes.get('/club', ClubController.index);
routes.post('/club', ClubController.store);
routes.put('/club', ClubController.update);
routes.delete('/club/:id', ClubController.delete);

routes.get('/event', EventController.index);
routes.get('/event/all', EventController.fetchAll);
routes.post('/event', EventController.store);
routes.put('/event', EventController.update);
routes.delete('/event/:id', EventController.delete);

routes.get('/player', PlayerController.index);
routes.get('/player/all', PlayerController.fetchAll);
routes.post('/player', PlayerController.store);
routes.put('/player', PlayerController.update);
routes.delete('/player/:id', PlayerController.delete);
routes.put('/player/:id/reset_password', PlayerController.resetPassword);

routes.get('/sponsor', SponsorController.index);
routes.post('/sponsor', SponsorController.store);
routes.put('/sponsor', SponsorController.update);
routes.delete('/sponsor/:id', SponsorController.delete);

routes.get('/statute', StatuteController.index);
routes.post('/statute', StatuteController.store);
routes.put('/statute', StatuteController.update);
routes.delete('/statute/:id', StatuteController.delete);

routes.get('/user', UserController.index);
routes.get('/user/find', UserController.findOne);

routes.get('/payment', MonthlyPaymentController.index);
routes.get('/payment/paid', MonthlyPaymentController.listPaid);
routes.get('/payment/debit', MonthlyPaymentController.listDebit);
routes.post('/payment', MonthlyPaymentController.store);
routes.put('/payment', MonthlyPaymentController.update);
routes.delete('/payment/:id', MonthlyPaymentController.delete);
routes.post('/payment_non_paying', MonthlyPaymentController.storeNonPaying);

routes.get('/match', MatchController.index);
routes.get('/match/byDate', MatchController.listByDate);
routes.get('/match/:id', MatchController.findOne);
routes.post('/match', MatchController.store);
routes.put('/match', MatchController.update);
routes.delete('/match/:id', MatchController.delete);

routes.put('/escalation', EscalationController.update);
routes.post('/escalation', EscalationController.store);
routes.delete('/escalation/:id', EscalationController.delete);

routes.post('/match_event', MatchEventController.store);
// routes.put('/match', MatchEventController.update);
routes.delete('/match_event/:id', MatchEventController.delete);

routes.get('/report/artilharia', ReportController.artilharia);
routes.get('/report/jogadores', ReportController.jogadores);
routes.get('/report/financeiro', ReportController.financeiro);
routes.get('/report/aniversario', ReportController.aniversario);
routes.get('/report/pontuacaoGeral', ReportController.pontuacaoGeral);
routes.get('/report/pontuacaoGeralPosicao', ReportController.pontuacaoGeralPorPontuacao);

export default routes;
