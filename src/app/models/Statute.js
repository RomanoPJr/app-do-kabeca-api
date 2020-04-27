import Sequelize, { Model } from 'sequelize';

class Statute extends Model {
  static init(sequelize) {
    super.init(
      {
        club_id: Sequelize.INTEGER,
        description: Sequelize.TEXT,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Statute;
