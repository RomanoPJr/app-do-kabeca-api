import Sequelize, { Model } from 'sequelize';

class Sponsor extends Model {
  static init(sequelize) {
    super.init(
      {
        club_id: Sequelize.INTEGER,
        name: Sequelize.STRING,
        value: Sequelize.INTEGER,
        banner_url: Sequelize.TEXT,
        status: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Sponsor;
