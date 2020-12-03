module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('monthly_payments', 'referent', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  down: queryInterface => {},
};
