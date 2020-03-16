import Sequelize from 'sequelize';

import Admin from '../app/models/Admin';
import databaseConfig from '../config/database';
import Organizer from '../app/models/Organizer';
import EventSuggestion from '../app/models/EventSuggestion';
import StatuteSuggestion from '../app/models/StatuteSuggestion';

const models = [Admin, StatuteSuggestion, EventSuggestion, Organizer];

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
