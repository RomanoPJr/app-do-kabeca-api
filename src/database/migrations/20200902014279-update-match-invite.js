module.exports = {
  up: (queryInterface, Sequelize) => {
    return (
      queryInterface.removeConstraint('matches_invites', 'matches_invites_match_id_fkey'),
      queryInterface.removeColumn('matches_invites', 'match_id'),
      queryInterface.addColumn('matches_invites', 'club_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'clubs',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
        allowNull: true,
      })
    );
  },

  down: (queryInterface, Sequelize) => {
    return (
      queryInterface.addColumn('matches_invites', 'match_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'matches',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
      queryInterface.removeConstraint('matches_invites', 'matches_invites_club_id_fkey'),
      queryInterface.removeColumn('matches_invites', 'club_id')
    );
  },
};
