import Sequelize, { Model } from 'sequelize';

class EventSuggestion extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
        value: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async event_suggestion => {
      event_suggestion.value *= 100;
    });

    this.addHook('afterFind', async event_suggestions => {
      if (event_suggestions) {
        if (event_suggestions.length) {
          event_suggestions.map(event_suggestion => {
            event_suggestion.value /= 100;
            return null;
          });
        } else {
          event_suggestions.value /= 100;
        }
      }
    });

    return this;
  }
}

export default EventSuggestion;
