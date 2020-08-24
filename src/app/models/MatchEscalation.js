import Sequelize, { Model } from 'sequelize';

class MatchEscalation extends Model {
  static init(sequelize) {
    super.init(
      {
        match_id: Sequelize.INTEGER,
        user_id: Sequelize.INTEGER,
        round: Sequelize.ENUM('1º TEMPO', '2º TEMPO'),
        position: Sequelize.INTEGER,
        replaced: Sequelize.INTEGER,
        team: Sequelize.ENUM('TIME A', 'TIME B'),
      },
      {
        sequelize,
        tableName: 'matches_escalations',
      }
    );
    return this;
  }

  static associate(models) {
    this.hasOne(models.User, { foreignKey: 'id', sourceKey: 'user_id' });
  }
}

export default MatchEscalation;
