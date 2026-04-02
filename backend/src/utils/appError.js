class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const createAppError = (message, statusCode = 500) => new AppError(message, statusCode);

module.exports = {
  AppError,
  createAppError
};
