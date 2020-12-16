module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('seasons', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      club_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'clubs',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      date_start: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      date_end: {
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
    return queryInterface.dropTable('seasons');
  },
};
