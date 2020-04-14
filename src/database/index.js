import Sequelize from 'sequelize';

import Club from '../app/models/Club';
import User from '../app/models/User';
import Event from '../app/models/Event';
import Sponsor from '../app/models/Sponsor';
import databaseConfig from '../config/database';
import EventSuggestion from '../app/models/EventSuggestion';
import StatuteSuggestion from '../app/models/StatuteSuggestion';

const models = [User, Club, Event, StatuteSuggestion, Sponsor, EventSuggestion];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models.map(model => model.init(this.connection));
  }
}

export default new Database();
