module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('matches', 'status', {
      type: Sequelize.ENUM,
      values: ['PREPARAÇÃO', 'EM ANDAMENTO', 'FINALIZADO'],
      allowNull: false,
      defaultValue: 'PREPARAÇÃO',
    });
  },
  down: queryInterface => {
    queryInterface.removeColumn('matches', 'status');
  },
};
