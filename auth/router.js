const express = require('express');
const router = express.Router();

const User = require('../models/user');
const { authLocal, authJwt } = require('./strategies');
const v = require('../validations/user');

router.post('/login', v.sanitizeLogin, authLocal, (req, res) => {
  const token = req.user.createAuthToken();
  res.json({ token });
});

router.post('/refresh', v.sanitizeLogin, authJwt, (req, res) => {
  const token = req.user.createAuthToken();
  res.json({ token });
});

module.exports = router;