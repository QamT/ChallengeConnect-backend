const { check } = require('express-validator/check');

module.exports = {
  sanitizeName: [
    check('name').trim().escape()
  ]
}