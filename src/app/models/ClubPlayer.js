import Sequelize, { Model } from 'sequelize';

class ClubPlayer extends Model {
  static init(sequelize) {
    super.init(
      {
        club_id: Sequelize.INTEGER,
        user_id: Sequelize.INTEGER,
        invite: Sequelize.ENUM('ACEITO', 'AGUARDANDO', 'NEGADO', 'BLOQUEADO'),
        monthly_payment: Sequelize.DECIMAL,
        created_at: Sequelize.DATE,
        status: Sequelize.ENUM(['ATIVO', 'INATIVO']),
        position: Sequelize.ENUM('GOLEIRO', 'DEFESA', 'MEIO', 'ATAQUE', 'COLABORADOR'),
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
    this.hasMany(models.MatchInviteConfirmation, {
      foreignKey: 'club_player_id',
    });
    this.hasMany(models.Club, {
      foreignKey: 'id',
      sourceKey: 'club_id',
    });
  }
}

export default ClubPlayer;
