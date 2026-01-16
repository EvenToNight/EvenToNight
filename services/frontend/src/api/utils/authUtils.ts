export const ONE_MINUTE = 60
export const ONE_HOUR = 60 * ONE_MINUTE
export const ONE_DAY = 24 * ONE_HOUR
export const ONE_YEAR = 365 * ONE_DAY

export function generateFakeToken(userId: string, expiresIn: number): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const payload = {
    user_id: userId,
    exp: Math.floor(Date.now() / 1000 + expiresIn),
  }

  const base64UrlEncode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const encodedHeader = base64UrlEncode(header)
  const encodedPayload = base64UrlEncode(payload)
  return `${encodedHeader}.${encodedPayload}.fake_signature`
}
