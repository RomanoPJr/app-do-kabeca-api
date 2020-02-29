import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import Admin from '../app/models/Admin';

const models = [Admin];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // this.connection = new Sequelize(databaseConfig);
    this.connection = new Sequelize(
      'postgres://iwkaalrbjdidpu:7c2fe60f6f567c3829032dca8b0a60309183deba470793fae524324e1004ca19@ec2-18-213-176-229.compute-1.amazonaws.com:5432/d6hnnuje1gflkc?ssl=true'
    );

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
