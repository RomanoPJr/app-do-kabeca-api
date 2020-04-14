module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('clubs', {
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
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      day: {
        type: Sequelize.ENUM,
        values: [
          'SEGUNDA-FEIRA',
          'TERÇA-FEIRA',
          'QUARTA-FEIRA',
          'QUINTA-FEIRA',
          'SEXTA-FEIRA',
          'SÁBADO',
          'DOMINGO',
        ],
        allowNull: false,
      },
      time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      payment_module_view_type: {
        type: Sequelize.ENUM,
        values: ['ALL', 'INDIVIDUAL'],
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      logo_url: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('clubs');
  },
};
