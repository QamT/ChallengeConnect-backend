require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const server = require('./server');
const middlewares = require('./middleware');
const routes = require('./routes/index');
const { CLIENT_ORIGIN } = require('./config');
const { DATABASE_URL, PORT } = require('./config');

app.use(cors({
  origin: '*'
}));

middlewares(app);
routes(app);

app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if(require.main === module) {
  server.runServer(app, DATABASE_URL).catch(err => console.log(err));
}

module.exports = app;

//test api with postman
//setup heroko and ci
//push to github

//set up websockets
//set up tests