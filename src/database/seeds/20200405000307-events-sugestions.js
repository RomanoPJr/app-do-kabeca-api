module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'event_suggestions',
      [
        {
          description: 'VITORIA',
          value: 300,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: 'EMPATE',
          value: 100,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: 'CARTÃO AZUL',
          value: -100,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: 'CARTÃO AMARELO',
          value: -50,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: 'CANETA JOGADOR APLICA',
          value: 100,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: 'CHAPEU JOGADOR RECEBE',
          value: -50,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: 'GOLEIRO DEFESA DIFICIL',
          value: 100,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: 'GOLEIRO TOMOU FRANGO',
          value: -50,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: 'PRESENÇA NA PARTIDA',
          value: -50,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('event_suggestions', null, {});
  },
};
