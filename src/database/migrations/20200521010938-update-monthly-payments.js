module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('monthly_payments', 'value'),
      queryInterface.addColumn('monthly_payments', 'due_value', {
        type: Sequelize.FLOAT(2),
        allowNull: false,
        defaultValue: 0,
      }),
      queryInterface.addColumn('monthly_payments', 'paid_value', {
        type: Sequelize.FLOAT(2),
        allowNull: false,
        defaultValue: 0,
      }),
    ]);
  },
  down: () => {},
};
