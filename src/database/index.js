import Sequelize from 'sequelize';

import Club from '../app/models/Club';
import User from '../app/models/User';
import Event from '../app/models/Event';
import Sponsor from '../app/models/Sponsor';
import Statute from '../app/models/Statute';
import databaseConfig from '../config/database';
import ClubPlayer from '../app/models/ClubPlayer';
import MonthlyPayment from '../app/models/MonthlyPayment';
import SuggestionEvent from '../app/models/SuggestionEvent';
import SuggestionStatute from '../app/models/SuggestionStatute';

const models = [
  User,
  Club,
  Event,
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
