import Sequelize from 'sequelize';

import Club from '../app/models/Club';
import User from '../app/models/User';
import Event from '../app/models/Event';
import Match from '../app/models/Match';
import Sponsor from '../app/models/Sponsor';
import Statute from '../app/models/Statute';
import databaseConfig from '../config/database';
import ClubPlayer from '../app/models/ClubPlayer';
import MonthlyPayment from '../app/models/MonthlyPayment';
import MatchEscalation from '../app/models/MatchEscalation';
import MatchEvent from '../app/models/MatchEvent';
import SuggestionEvent from '../app/models/SuggestionEvent';
import SuggestionStatute from '../app/models/SuggestionStatute';

const models = [
  User,
  Club,
  Event,
  Match,
  MatchEvent,
  MatchEscalation,
  Sponsor,
  Statute,
  ClubPlayer,
  MonthlyPayment,
  SuggestionEvent,
  SuggestionStatute,
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
