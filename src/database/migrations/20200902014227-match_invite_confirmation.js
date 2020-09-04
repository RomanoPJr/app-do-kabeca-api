module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('matches_invites_confirmations', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
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
      match_invite_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'matches_invites',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      club_player_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'club_players',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      match_date: {
        type: Sequelize.DATEONLY,
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
    return queryInterface.dropTable('matches_invites_confirmations');
  },
};
