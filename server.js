const mongoose = require('mongoose');

const { PORT } = require('./config');

let server;

function runServer(app, dbUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(dbUrl, err => {
      if(err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`App is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      server.close(err => {
        if(err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

module.exports = { runServer, closeServer };