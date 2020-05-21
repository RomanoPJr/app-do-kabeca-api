import Sequelize, { Model } from 'sequelize';

class MonthlyPayment extends Model {
  static init(sequelize) {
    super.init(
      {
        club_player_id: Sequelize.INTEGER,
        due_value: Sequelize.INTEGER,
        paid_value: Sequelize.INTEGER,
        referent: Sequelize.DATEONLY,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.ClubPlayer);
  }
}

export default MonthlyPayment;
