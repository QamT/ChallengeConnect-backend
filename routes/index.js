const users = require('./user');
const auth = require('../auth/router');
const challenges = require('./challenge');
const teams = require('./team');
const admin = require('./admin');
const globalData = require('./globalData');

module.exports = app => {
  app.use('/user', users);
  app.use('/api', auth);
  app.use('/challenge', challenges);
  app.use('/team', teams);
  app.use('/admin', admin);
  app.use('/globalData', globalData);
}