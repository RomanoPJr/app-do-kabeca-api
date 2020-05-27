module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('monthly_payments', 'club_player_id'),
      queryInterface.addColumn('monthly_payments', 'club_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'clubs',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
        allowNull: false,
        defaultValue: 2,
      }),
      queryInterface.addColumn('monthly_payments', 'name', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      }),
      queryInterface.addColumn('monthly_payments', 'phone', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      }),
    ]);
  },
  down: () => { },
};
