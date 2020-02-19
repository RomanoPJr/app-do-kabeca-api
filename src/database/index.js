import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import Admin from '../app/models/Admin';

require('dotenv').config();

const models = [Admin];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(process.env.DATABASE_URL, databaseConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
