import Sequelize, { Model } from 'sequelize';

class MonthlyPayment extends Model {
  static init(sequelize) {
    super.init(
      {
        club_id: Sequelize.INTEGER,
        name: Sequelize.STRING,
        phone: Sequelize.STRING,
        due_value: Sequelize.DECIMAL,
        paid_value: Sequelize.DECIMAL,
        referent: Sequelize.DATEONLY,
        position: Sequelize.ENUM('GOLEIRO', 'DEFESA', 'MEIO', 'ATAQUE', 'COLABORADOR'),
        player_id: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.ClubPlayer, { foreignKey: 'player_id' });
  }
}

export default MonthlyPayment;
