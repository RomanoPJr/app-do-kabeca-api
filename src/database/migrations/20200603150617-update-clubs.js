module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('clubs', 'plan_type', {
      type: Sequelize.ENUM,
      values: ['30', '60'],
      allowNull: false,
      defaultValue: '30',
    });
  },
  down: () => {},
};
