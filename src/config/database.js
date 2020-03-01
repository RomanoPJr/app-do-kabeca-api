require('dotenv').config();

module.exports = {
  dialect: 'postgres',
  protocol: 'postgres',
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  // native: true,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
