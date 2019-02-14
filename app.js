require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const socket = require('socket.io');
const io = socket(http);
const validate = require('validator');

const server = require('./server');
const middlewares = require('./middleware');
const routes = require('./routes/index');
const { AppError } = require('./utils');
const { CLIENT_ORIGIN } = require('./config');
const { DATABASE_URL, PORT } = require('./config');

app.use(cors({ origin: CLIENT_ORIGIN }));

middlewares(app);
routes(app);

app.use((req, res) => {
  res.status(404).json('Page Not Found');
});

app.use((err, req, res, next) => {
  if (app.get('env') === 'development') {
    return res.status(err.status || 500).json({ message: err.message, stack: err.stack });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err instanceof AppError) return res.status(err.status).json(err.message);
  if (err.name === 'ValidationError') return res.status(400).json(err.message);
  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).json('something went wrong');
});

if(require.main === module) {
  server.runServer(http, DATABASE_URL).catch(err => console.log(err));
};

io.on('connection', socket => {
  console.log('Socket connected: ', socket.id);

  socket.on('SEND_MESSAGE', data => {
    data.message = validate.blacklist(data.message, ['<','>','&','"','/']);
    io.emit('RECEIVE_MESSAGE', data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected: ', socket.id);
  });

  socket.on('error', err => console.log(err));
});

module.exports = app;



