module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('events', {
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
      status: {
        type: Sequelize.ENUM,
        values: ['ATIVO', 'INATIVO'],
        allowNull: false,
        defaultValue: 'ATIVO',
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
    return queryInterface.dropTable('events');
  },
};
