module.exports = {
  up: (queryInterface, Sequelize) => {
    return (
      queryInterface.addColumn('matches', 'timer_1', {
        type: Sequelize.DATE,
      }),
      queryInterface.addColumn('matches', 'timer_2', {
        type: Sequelize.DATE,
      })
    );
  },

  down: () => {},
};
