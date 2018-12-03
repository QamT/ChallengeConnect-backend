const { check } = require('express-validator/check');

module.exports = {
  validateReason: [
    check('reason').exists().withMessage('Reason is required').isString().trim().escape()
  ]
}