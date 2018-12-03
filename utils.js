class AppError extends Error {
  constructor (message, status = 400) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.status = status;
  }
}

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

const validationHandler = next => result => {
  if (result.isEmpty()) return;

  return next(new AppError(result.array().map(err => err.msg).join(' ')));
}

module.exports = { AppError, wrapAsync, validationHandler };