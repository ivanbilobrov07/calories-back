process.env.JWT_SECRET = 'test-secret-key';

const { signToken, verifyToken, JWT_EXPIRES_IN } = require('../../utils/jwt');

describe('JWT utils', () => {
  describe('JWT_EXPIRES_IN', () => {
    test('is 24h', () => {
      expect(JWT_EXPIRES_IN).toBe('24h');
    });
  });

  describe('signToken', () => {
    test('returns a string', () => {
      const token = signToken('user-123');
      expect(typeof token).toBe('string');
    });

    test('returns a JWT with three parts', () => {
      const token = signToken('user-456');
      expect(token.split('.')).toHaveLength(3);
    });

    test('encodes the userId as sub claim', () => {
      const userId = 'user-abc';
      const token = signToken(userId);
      const payload = verifyToken(token);
      expect(payload.sub).toBe(userId);
    });

    test('different userIds produce different tokens', () => {
      const t1 = signToken('user-1');
      const t2 = signToken('user-2');
      expect(t1).not.toBe(t2);
    });
  });

  describe('verifyToken', () => {
    test('returns payload for a valid token', () => {
      const token = signToken('user-xyz');
      const payload = verifyToken(token);
      expect(payload).toBeDefined();
      expect(payload.sub).toBe('user-xyz');
    });

    test('throws for an invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    test('throws for a tampered token', () => {
      const token = signToken('user-1');
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyToken(tampered)).toThrow();
    });

    test('throws for an empty string', () => {
      expect(() => verifyToken('')).toThrow();
    });
  });
});
