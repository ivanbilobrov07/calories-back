const errorHandler = require('../../middleware/errorHandler');

describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('uses err.statusCode when present', () => {
    const err = { statusCode: 404, message: 'Not Found' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('defaults to 500 when statusCode is missing', () => {
    const err = new Error('Unexpected');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('responds with the error message', () => {
    const err = { statusCode: 400, message: 'Bad Request' };
    errorHandler(err, req, res, next);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bad Request' });
  });

  test('defaults to "Internal Server Error" when message is missing', () => {
    const err = { statusCode: 500 };
    errorHandler(err, req, res, next);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });

  test('logs 500 errors to console', () => {
    const err = new Error('crash');
    errorHandler(err, req, res, next);
    expect(console.error).toHaveBeenCalledWith(err);
  });

  test('does not log non-500 errors', () => {
    const err = { statusCode: 404, message: 'Not found' };
    errorHandler(err, req, res, next);
    expect(console.error).not.toHaveBeenCalled();
  });
});
