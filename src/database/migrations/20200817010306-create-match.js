module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('matches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      team_a: {
        type: Sequelize.TEXT,
      },
      team_b: {
        type: Sequelize.TEXT,
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      duration: {
        type: Sequelize.INTEGER,
      },
      modality: {
        type: Sequelize.ENUM,
        values: ['1 TEMPO', '2 TEMPOS'],
        allowNull: false,
        defaultValue: '1 TEMPO',
      },
      players_quantity: {
        type: Sequelize.INTEGER,
      },
      score_type: {
        type: Sequelize.ENUM,
        values: ['RANKEADA', 'NÃO RANKEADA'],
        allowNull: false,
        defaultValue: 'RANKEADA',
      },
      type: {
        type: Sequelize.ENUM,
        values: ['PARTIDA INTERNA', 'PARTIDA EXTERNA'],
        allowNull: false,
        defaultValue: 'PARTIDA INTERNA',
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
    return queryInterface.dropTable('matches');
  },
};
