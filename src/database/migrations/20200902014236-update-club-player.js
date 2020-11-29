module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('club_players', 'status', {
      type: Sequelize.ENUM,
      values: ['ATIVO', 'INATIVO'],
      defaultValue: 'ATIVO',
    });
  },

  down: queryInterface => {
    return Promise.all([queryInterface.removeColumn('club_players', 'status')]);
  },
};
