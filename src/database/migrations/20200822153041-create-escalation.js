module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('matches_escalations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      match_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'matches',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
        allowNull: false,
      },
      round: {
        type: Sequelize.ENUM,
        values: ['1º TEMPO', '2º TEMPO'],
        allowNull: false,
        defaultValue: '1º TEMPO',
      },
      position: {
        type: Sequelize.INTEGER,
      },
      replaced: {
        type: Sequelize.INTEGER,
        references: {
          model: 'matches_escalations',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      team: {
        type: Sequelize.ENUM,
        values: ['TIME A', 'TIME B'],
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: queryInterface => {
    return queryInterface.dropTable('matches_escalations');
  },
};
