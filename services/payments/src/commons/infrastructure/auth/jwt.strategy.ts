import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  user_id: string;
  exp: number;
}

export interface AuthUser {
  userId: string;
}

interface PublicKeyEntry {
  kid: string;
  pem: string;
}

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy)
  implements OnModuleInit
{
  private static publicKeys: PublicKeyEntry[] = [];
  private static fallbackKey: string | null = null;
  private static isDevelopment = process.env.NODE_ENV === 'development';
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: JwtStrategy.isDevelopment,
      secretOrKeyProvider: (
        _request: unknown,
        rawJwtToken: string,
        done: (err: Error | null, key?: string) => void,
      ) => {
        // In development, skip signature validation entirely
        if (JwtStrategy.isDevelopment) {
          // Use a dummy key - passport-jwt still needs one, but with 'none' algorithm it won't verify
          done(null, 'dev-skip-validation');
          return;
        }

        if (JwtStrategy.fallbackKey) {
          done(null, JwtStrategy.fallbackKey);
          return;
        }

        this.getKeyForToken(rawJwtToken)
          .then((key) => {
            if (key) {
              done(null, key);
            } else {
              done(new Error('No matching public key found for token'));
            }
          })
          .catch((err: Error) => done(err));
      },
      algorithms: JwtStrategy.isDevelopment
        ? ['none', 'HS256', 'RS256']
        : ['RS256'],
    });
  }

  private async getKeyForToken(token: string): Promise<string | null> {
    const kid = this.extractKidFromToken(token);

    if (kid) {
      let keyEntry = JwtStrategy.publicKeys.find((k) => k.kid === kid);
      if (keyEntry) {
        return keyEntry.pem;
      }

      this.logger.log(`Key with kid ${kid} not found, refreshing keys...`);
      await this.refreshPublicKeys();

      keyEntry = JwtStrategy.publicKeys.find((k) => k.kid === kid);
      if (keyEntry) {
        return keyEntry.pem;
      }
    }
    return JwtStrategy.publicKeys[0]?.pem ?? null;
  }

  private extractKidFromToken(token: string): string | null {
    try {
      const [headerB64] = token.split('.');
      const header = JSON.parse(
        Buffer.from(headerB64, 'base64').toString(),
      ) as { kid?: string };
      return header.kid ?? null;
    } catch {
      return null;
    }
  }

  async onModuleInit() {
    await this.loadPublicKey();
  }

  private async refreshPublicKeys(): Promise<void> {
    const publicKeyUrl = process.env.AUTH_PUBLIC_KEY_URL;
    if (!publicKeyUrl) return;

    try {
      const response = await fetch(publicKeyUrl);
      if (!response.ok) {
        this.logger.warn(`Failed to refresh keys: ${response.statusText}`);
        return;
      }
      const data = (await response.json()) as {
        keys: { kid: string; publicKey: string }[];
      };
      if (data.keys?.length) {
        JwtStrategy.publicKeys = data.keys.map((key) => ({
          kid: key.kid,
          pem: `-----BEGIN PUBLIC KEY-----\n${key.publicKey}\n-----END PUBLIC KEY-----`,
        }));
        this.logger.log(
          `Refreshed ${JwtStrategy.publicKeys.length} public key(s)`,
        );
      }
    } catch (error) {
      this.logger.warn('Failed to refresh public keys', error);
    }
  }

  private async loadPublicKey(): Promise<void> {
    const publicKeyUrl = process.env.AUTH_PUBLIC_KEY_URL;

    if (JwtStrategy.isDevelopment || !publicKeyUrl) {
      this.logger.warn(
        'Development mode or AUTH_PUBLIC_KEY_URL not set, using fallback key',
      );
      JwtStrategy.fallbackKey = process.env.JWT_SECRET || 'dev-secret-key';
      return;
    }

    try {
      const response = await fetch(publicKeyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch public key: ${response.statusText}`);
      }
      const data = (await response.json()) as {
        keys: { kid: string; publicKey: string }[];
      };
      if (!data.keys?.length) {
        throw new Error('No public keys found in response');
      }
      // Convert all keys to PEM format
      JwtStrategy.publicKeys = data.keys.map((key) => ({
        kid: key.kid,
        pem: `-----BEGIN PUBLIC KEY-----\n${key.publicKey}\n-----END PUBLIC KEY-----`,
      }));
      this.logger.log(`Loaded ${JwtStrategy.publicKeys.length} public key(s)`);
    } catch (error) {
      this.logger.error('Failed to load public key', error);
      throw error;
    }
  }

  validate(payload: JwtPayload): AuthUser {
    return { userId: payload.user_id };
  }
}
