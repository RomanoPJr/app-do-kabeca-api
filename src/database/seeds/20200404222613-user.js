module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'ADMIN',
          email: 'ADMIN@APPDOKABECA.COM',
          phone: '2730625300',
          birth_date: null,
          password_hash:
            '$2a$08$7chOMFSHmUXojBpG/yg0Lu4.wQrufFTZOP0DuM3B1AqKO.9t7LQQG',
          status: 'ACTIVE',
          type: 'ADMIN',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'PELADA DO KABEÇA',
          email: 'ORGANIZADOR1@GMAIL.COM',
          phone: '27995082289',
          birth_date: null,
          password_hash:
            '$2a$08$NyoOhbO3nXuVKC7nPkQDxOphVI/5PPTjdHXSF.ntFHiTuWEgiStE2',
          status: 'ACTIVE',
          type: 'ORGANIZER',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'REDE MARCELA SOCIETY',
          email: 'ORGANIZADOR2@GMAIL.COM',
          phone: '27995082287',
          birth_date: null,
          password_hash:
            '$2a$08$ZScnmMojT1nTQkzx/SiGDu7V0mQFkDmGn83blig0PJBIbGGGAFelq',
          status: 'ACTIVE',
          type: 'ORGANIZER',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'PELADA DA GLÓRIA',
          email: 'ORGANIZADOR3@GMAIL.COM',
          phone: '27234234234',
          birth_date: null,
          password_hash:
            '$2a$08$8Unwmax9At9qaZ7rk4GnT.kzKfIm1szMhN79wDO1wBRssXHwdvFyO',
          status: 'ACTIVE',
          type: 'ORGANIZER',
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
