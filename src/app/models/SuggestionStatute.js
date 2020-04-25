import Sequelize, { Model } from 'sequelize';

class SuggestionStatute extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.TEXT,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default SuggestionStatute;
