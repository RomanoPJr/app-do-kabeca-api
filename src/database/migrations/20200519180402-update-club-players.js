module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('club_players', 'type'),
      queryInterface.addColumn('club_players', 'monthly_payment', {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      }),
      queryInterface.sequelize.query(
        "ALTER TYPE enum_club_players_position ADD VALUE 'COLABORADOR'"
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('club_players', 'type', {
        type: Sequelize.ENUM,
        types: ['JOGADOR', 'COLABORADOR'],
        allowNull: false,
        defaultValue: 'JOGADOR',
      }),
      queryInterface.removeColumn('club_players', 'monthly_payment'),
      queryInterface.changeColumn('club_players', 'position', {
        type: Sequelize.ENUM,
        values: ['GOLEIRO', 'DEFESA', 'MEIO', 'ATAQUE'],
        allowNull: false,
        defaultValue: 'ATAQUE',
      }),
    ]);
  },
};
