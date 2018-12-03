const { check } = require('express-validator/check');
const { AppError } = require('../utils');

module.exports = {
  validateUser: [
    check('username').exists().withMessage('Username is required')
      .isLength({ min: 6 }).withMessage('Username should contain at least 6 characters')
      .isAlphanumeric().withMessage('Username can only contain alphanumeric characters')
      .custom(value => {
        if (value.trim() !== value) throw new AppError('Username cannot start or end with whitespace')
      })
      .trim().escape(),
    check('password').exists().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password should contain at least 6 characters')
      .isAlphanumeric().withMessage('Password can only contain alphanumeric characters')
      .custom(value => {
        if (value.trim() !== value) throw new AppError('Password cannot start or end with whitespace')
      })
      .trim().escape(),
    check('firstName').exists().withMessage('First name is required')
      .isAlpha().withMessage('Invalid name')
      .trim().escape(),
    check('lastName').exists().withMessage('Last name is required')
      .isAlpha().withMessage('Invalid name')
      .trim().escape()
  ],

  validateDetails: [
    check('user.birthDate').optional()
    .custom(value => {
      const date = new Date(value);
      if (!date.getTime()) throw new AppError
    }),
    check('user.gender').optional().isIn(['male', 'female']),
    check('user.about').optional().trim().escape(),
    check('user.location.country').optional().isString(),
    check('file.type').optional().matches(/^.*\.(jpg|jpeg|png)/).withMessage('File must be an image')
  ],

  sanitizeLogin: [
    check('username').trim().escape(),
    check('password').trim().escape()
  ]
}