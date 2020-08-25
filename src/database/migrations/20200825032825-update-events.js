module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.query(
      "ALTER TYPE enum_events_type ADD VALUE 'GOL SOFRIDO'"
    );
  },

  down: () => {},
};
