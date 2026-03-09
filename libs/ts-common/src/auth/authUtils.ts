import * as jwt from 'jsonwebtoken';

export const ONE_MINUTE = 60;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_YEAR = 365 * ONE_DAY;

const DEV_SECRET = 'dev-skip-validation';

export function generateFakeToken(userId: string, expiresIn: number): string {
  return jwt.sign({ user_id: userId }, DEV_SECRET, {
    algorithm: 'HS256',
    expiresIn,
  });
}
