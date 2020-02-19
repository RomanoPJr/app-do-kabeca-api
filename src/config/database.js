require('dotenv').config();

module.exports = {
  dialect: 'postgres',
  protocol: 'postgres',
  host: process.env.DATABASE_URL,
  // username: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  // ssl: true,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};