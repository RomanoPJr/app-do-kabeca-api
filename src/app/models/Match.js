import Sequelize, { Model } from 'sequelize';

class Match extends Model {
  static init(sequelize) {
    super.init(
      {
        team_a: Sequelize.TEXT,
        team_b: Sequelize.TEXT,
        date: Sequelize.DATEONLY,
        club_id: Sequelize.INTEGER,
        duration: Sequelize.INTEGER,
        players_quantity: Sequelize.INTEGER,
        modality: Sequelize.ENUM('1 TEMPO', '2 TEMPOS'),
        score_type: Sequelize.ENUM('RANKEADA', 'NÃO RANKEADA'),
        type: Sequelize.ENUM('PARTIDA INTERNA', 'PARTIDA EXTERNA'),
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.MatchEscalation, { foreignKey: 'match_id' });
    this.hasMany(models.MatchEvent, { foreignKey: 'match_id' });
  }
}

export default Match;