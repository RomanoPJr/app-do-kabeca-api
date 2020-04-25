module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('club_players', {
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
      position: {
        type: Sequelize.ENUM,
        values: ['GOLEIRO', 'DEFESA', 'MEIO', 'ATAQUE'],
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM,
        values: ['JOGADOR', 'COLABORADOR'],
        allowNull: false,
      },
      invite: {
        type: Sequelize.ENUM,
        values: ['ACEITO', 'AGUARDANDO', 'NEGADO', 'BLOQUEADO'],
        defaultValue: 'AGUARDANDO',
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
    return queryInterface.dropTable('club_players');
  },
};
