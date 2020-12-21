import Sequelize, { Model } from 'sequelize';

class MatchInviteConfirmation extends Model {
  static init(sequelize) {
    super.init(
      {
        match_invite_id: Sequelize.INTEGER,
        club_player_id: Sequelize.INTEGER,
        match_date: Sequelize.DATEONLY,
      },
      {
        sequelize,
        tableName: 'matches_invites_confirmations',
      }
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.MatchInvite, { foreignKey: 'id', sourceKey: 'match_invite_id' });
    this.hasOne(models.ClubPlayer, { foreignKey: 'id', sourceKey: 'club_player_id' });
  }
}

export default MatchInviteConfirmation;
