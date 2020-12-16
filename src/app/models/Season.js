import Sequelize, { Model } from 'sequelize';

class Season extends Model {
  static init(sequelize) {
    super.init(
      {
        club_id: Sequelize.INTEGER,
        name: Sequelize.STRING,
        date_start: Sequelize.DATEONLY,
        date_end: Sequelize.DATEONLY,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.Club, {
      foreignKey: 'id',
      sourceKey: 'club_id',
    });
  }
}

export default Season;
