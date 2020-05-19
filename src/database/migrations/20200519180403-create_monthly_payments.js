module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('monthly_payments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      club_player_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'club_players',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
        allowNull: false,
      },
      value: {
        type: Sequelize.FLOAT(2),
        allowNull: false,
      },
      referent: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('monthly_payments');
  },
};
