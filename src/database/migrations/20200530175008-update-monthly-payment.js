module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('monthly_payments', 'position', {
      type: Sequelize.ENUM,
      values: ['GOLEIRO', 'DEFESA', 'MEIO', 'ATAQUE', 'COLABORADOR'],
      allowNull: false,
      defaultValue: 'MEIO',
    });
  },
  down: () => { },
};
