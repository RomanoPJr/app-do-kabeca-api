import Sequelize, { Model } from 'sequelize';

class Event extends Model {
  static init(sequelize) {
    super.init(
      {
        club_id: Sequelize.INTEGER,
        description: Sequelize.STRING,
        value: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async event => {
      event.value *= 100;
    });

    this.addHook('afterFind', async events => {
      if (events) {
        if (events.length) {
          events.map(event => {
            event.value /= 100;
            return null;
          });
        } else {
          events.value /= 100;
        }
      }
    });

    return this;
  }
}

export default Event;
