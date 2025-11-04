const { CustomError } = require('./errorHandler');

const notFoundHandler = (req, res, next) => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = { notFoundHandler };