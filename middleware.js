const express = require('express');
const logger = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const passport = require('passport');

module.exports = app => {
  app.use(compression());
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use(logger('dev'));
}