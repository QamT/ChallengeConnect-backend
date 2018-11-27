const express = require('express');
const router = express.Router();

const { User } = require('../models/user');
const { authLocal, authJwt } = require('./strategies');

router.post('/login', authLocal, (req, res) => {
  const token = req.user.createAuthToken();
  res.json({ token });
});

module.exports = router;