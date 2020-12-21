module.exports = {
  up: (queryInterface, Sequelize) => {
    return (
      queryInterface.removeConstraint('matches_invites_confirmations', 'matches_invites_confirmations_match_id_fkey'),
      queryInterface.removeColumn('matches_invites_confirmations', 'match_id')
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('matches_invites_confirmations', 'match_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'matches',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
  },
};
