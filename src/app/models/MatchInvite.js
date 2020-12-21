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

  // static associate(models) {
  //   this.hasOne(models.Match, { foreignKey: 'id', sourceKey: 'match_id' });
  // }
}

export default MatchInvite;
