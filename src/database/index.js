import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import Admin from '../app/models/Admin';
import StatuteSuggestion from '../app/models/StatuteSuggestion';
import EventSuggestion from '../app/models/EventSuggestion';

const models = [Admin, StatuteSuggestion, EventSuggestion];

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
