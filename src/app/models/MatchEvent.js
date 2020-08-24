import Sequelize, { Model } from 'sequelize';

class MatchEvent extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
        value: Sequelize.Sequelize.FLOAT(2),
        user_id: Sequelize.INTEGER,
        club_id: Sequelize.INTEGER,
        event_id: Sequelize.INTEGER,
        match_id: Sequelize.INTEGER,
        escalation_id: Sequelize.INTEGER,
        type: Sequelize.ENUM(
          'GOL',
          'VITORIA',
          'EMPATE',
          'DERROTA',
          'EVENTO 1',
          'EVENTO 2',
          'EVENTO 3',
          'EVENTO 4',
          'EVENTO 5'
        ),
      },
      {
        sequelize,
        tableName: 'matches_events',
      }
    );
    return this;
  }

  static associate(models) {
    this.hasOne(models.User, { foreignKey: 'id', sourceKey: 'user_id' });
    this.hasOne(models.Match, { foreignKey: 'id', sourceKey: 'match_id' });
    this.hasOne(models.MatchEscalation, {
      foreignKey: 'id',
      sourceKey: 'escalation_id',
    });
  }
}

export default MatchEvent;
