require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  CLIENT_ORIGIN: 'localhost:3000', //process.env.CLIENT_ORIGIN || 
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost/react-app',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-react-app',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
}