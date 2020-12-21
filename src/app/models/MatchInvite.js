import Sequelize, { Model } from 'sequelize';

class MatchInvite extends Model {
  static init(sequelize) {
    super.init(
      {
        club_id: Sequelize.INTEGER,
        match_date: Sequelize.DATEONLY,
      },
      {
        sequelize,
        tableName: 'matches_invites',
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.MatchInviteConfirmation, {
      foreignKey: 'match_invite_id',
    });
  }
}

export default MatchInvite;
