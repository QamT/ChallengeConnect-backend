const { check } = require('express-validator/check');

module.exports = {
  validateChallenge: [
    check('title').exists().withMessage('Title is required').isString().trim().escape(),
    check('challenges').exists().withMessage('Challenges are required')
      .isArray().isLength({ min: 5 }).withMessage('Five challenges are required'),
    check('challenges.*').isString().trim().blacklist(['<','>','&','"','/'])
  ]
}