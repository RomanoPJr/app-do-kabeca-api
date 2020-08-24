module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('matches_events', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
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
      event_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      type: {
        type: Sequelize.ENUM,
        values: [
          'GOL',
          'VITORIA',
          'EMPATE',
          'DERROTA',
          'EVENTO 1',
          'EVENTO 2',
          'EVENTO 3',
          'EVENTO 4',
          'EVENTO 5',
        ],
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.FLOAT(2),
      },
      escalation_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'matches_escalations',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      match_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'matches',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
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
    return queryInterface.dropTable('matches_events');
  },
};
