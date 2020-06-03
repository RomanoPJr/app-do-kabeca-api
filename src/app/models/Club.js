import Sequelize, { Model } from 'sequelize';

class Club extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: Sequelize.INTEGER,
        name: Sequelize.STRING,
        day: Sequelize.ENUM(
          'SEGUNDA-FEIRA',
          'TERÇA-FEIRA',
          'QUARTA-FEIRA',
          'QUINTA-FEIRA',
          'SEXTA-FEIRA',
          'SÁBADO',
          'DOMINGO'
        ),
        time: Sequelize.STRING,
        payment_module_view_type: Sequelize.ENUM('ALL', 'INDIVIDUAL'),
        city: Sequelize.STRING,
        state: Sequelize.STRING,
        logo_url: Sequelize.TEXT,
        plan_type: Sequelize.ENUM('30', '60'),
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Club;
