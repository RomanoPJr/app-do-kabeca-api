import Sequelize, { Model } from 'sequelize';

class StatuteSuggestion extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default StatuteSuggestion;
