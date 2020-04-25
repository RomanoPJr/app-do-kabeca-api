module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'ADMIN',
          email: 'ADMIN@APPDOKABECA.COM',
          phone: '27306253000',
          birth_date: '1995-09-21',
          password_hash:
            '$2a$08$7chOMFSHmUXojBpG/yg0Lu4.wQrufFTZOP0DuM3B1AqKO.9t7LQQG',
          status: 'ATIVO',
          type: 'ADMIN',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: queryInterface => {
    return queryInterface.bulkDelete('users', null, {});
  },
};
