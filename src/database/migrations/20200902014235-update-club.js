module.exports = {
  up: (queryInterface, Sequelize) => {
    return (
      queryInterface.addColumn('clubs', 'session_start', {
        type: Sequelize.DATE,
      }),
      queryInterface.addColumn('clubs', 'session_end', {
        type: Sequelize.DATE,
      })
    );
  },

  down: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn('clubs', 'sessionStart'),
      queryInterface.removeColumn('clubs', 'sessionEnd'),
    ]);
  },
};
