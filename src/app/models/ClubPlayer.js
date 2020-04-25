import Sequelize, { Model } from 'sequelize';

class ClubPlayer extends Model {
  static init(sequelize) {
    super.init(
      {
        club_id: Sequelize.INTEGER,
        user_id: Sequelize.INTEGER,
        type: Sequelize.ENUM('JOGADOR', 'COLABORADOR'),
        position: Sequelize.ENUM('GOLEIRO', 'DEFESA', 'MEIO', 'ATAQUE'),
        invite: Sequelize.ENUM('ACEITO', 'AGUARDANDO', 'NEGADO', 'BLOQUEADO'),
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default ClubPlayer;
