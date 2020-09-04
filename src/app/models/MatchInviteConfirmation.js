import Sequelize, { Model } from 'sequelize';

class MatchInviteConfirmation extends Model {
  static init(sequelize) {
    super.init(
      {
        match_id: Sequelize.INTEGER,
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

  // static associate(models) {
  //   this.hasOne(models.Match, { foreignKey: 'id', sourceKey: 'match_id' });
  //   this.hasOne(models.User, { foreignKey: 'id', sourceKey: 'user_id' });
  // }
}

export default MatchInviteConfirmation;
