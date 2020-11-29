module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('monthly_payments', 'player_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'club_players',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
      allowNull: false,
      defaultValue: 2,
    });
  },

  down: queryInterface => {
    return Promise.all([queryInterface.removeColumn('monthly_payments', 'player_id')]);
  },
};
