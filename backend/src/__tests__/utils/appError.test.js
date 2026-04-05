const { AppError, createAppError } = require('../../utils/appError');

describe('AppError', () => {
  test('sets message and statusCode from constructor', () => {
    const err = new AppError('Not Found', 404);
    expect(err.message).toBe('Not Found');
    expect(err.statusCode).toBe(404);
  });

  test('is an instance of Error', () => {
    const err = new AppError('Server Error', 500);
    expect(err).toBeInstanceOf(Error);
  });

  test('has correct name from Error prototype', () => {
    const err = new AppError('Bad Request', 400);
    expect(err instanceof AppError).toBe(true);
  });

  test('statusCode 403 is preserved', () => {
    const err = new AppError('Forbidden', 403);
    expect(err.statusCode).toBe(403);
  });
});

describe('createAppError', () => {
  test('creates AppError with given message and statusCode', () => {
    const err = createAppError('Conflict', 409);
    expect(err.message).toBe('Conflict');
    expect(err.statusCode).toBe(409);
    expect(err).toBeInstanceOf(AppError);
  });

  test('defaults statusCode to 500 when not provided', () => {
    const err = createAppError('Something went wrong');
    expect(err.statusCode).toBe(500);
  });

  test('returns AppError instance', () => {
    const err = createAppError('Unauthorized', 401);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });

  test('statusCode 400 is preserved', () => {
    const err = createAppError('Bad input', 400);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad input');
  });
});
