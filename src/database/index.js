import Sequelize from 'sequelize';

import User from '../app/models/User';
import databaseConfig from '../config/database';
import EventSuggestion from '../app/models/EventSuggestion';
import StatuteSuggestion from '../app/models/StatuteSuggestion';

const models = [User, StatuteSuggestion, EventSuggestion];

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
