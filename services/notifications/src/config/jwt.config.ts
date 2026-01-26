import jwt from "jsonwebtoken";
import { config } from "./env.config";

interface PublicKeyEntry {
  kid: string;
  pem: string;
}

interface JwtPayload {
  user_id: string;
  exp: number;
}

export class JwtService {
  private static publicKeys: PublicKeyEntry[] = [];
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (!config.jwtAuthPublicKeyUrl) {
      console.log(
        "⚠️  Development mode or AUTH_PUBLIC_KEY_URL not set, skipping verification",
      );
      this.isInitialized = true;
      return;
    }

    try {
      const response = await fetch(config.jwtAuthPublicKeyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch public key: ${response.statusText}`);
      }
      const data = (await response.json()) as {
        keys: { kid: string; publicKey: string }[];
      };
      if (!data.keys?.length) {
        throw new Error("No public keys found in response");
      }

      this.publicKeys = data.keys.map((key) => ({
        kid: key.kid,
        pem: `-----BEGIN PUBLIC KEY-----\n${key.publicKey}\n-----END PUBLIC KEY-----`,
      }));

      console.log(`✅ Loaded ${this.publicKeys.length} JWT public key(s)`);
      this.isInitialized = true;
    } catch (error) {
      console.error("❌ Failed to load public keys:", error);
      throw error;
    }
  }

  static async verifyToken(token: string): Promise<JwtPayload | null> {
    if (!config.jwtAuthPublicKeyUrl) {
      console.log("⚠️  JWT verification skipped (AUTH_PUBLIC_KEY_URL not set)");
      try {
        const decoded = jwt.decode(token) as JwtPayload;
        return decoded;
      } catch {
        return null;
      }
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const kid = this.extractKidFromToken(token);
      let publicKey: string | null = null;

      if (kid) {
        const keyEntry = this.publicKeys.find((k) => k.kid === kid);
        if (keyEntry) {
          publicKey = keyEntry.pem;
        } else {
          console.log(`Key with kid ${kid} not found, refreshing keys...`);
          await this.refreshPublicKeys();
          const refreshedKey = this.publicKeys.find((k) => k.kid === kid);
          if (refreshedKey) {
            publicKey = refreshedKey.pem;
          }
        }
      }

      if (!publicKey && this.publicKeys.length > 0) {
        publicKey = this.publicKeys[0].pem;
      }

      if (!publicKey) {
        throw new Error("No public key available for verification");
      }

      const decoded = jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
      }) as JwtPayload;

      return decoded;
    } catch (error) {
      console.error("❌ JWT verification failed:", error);
      return null;
    }
  }

  private static extractKidFromToken(token: string): string | null {
    try {
      const [headerB64] = token.split(".");
      const header = JSON.parse(
        Buffer.from(headerB64, "base64").toString(),
      ) as { kid?: string };
      return header.kid ?? null;
    } catch {
      return null;
    }
  }

  private static async refreshPublicKeys(): Promise<void> {
    if (!config.jwtAuthPublicKeyUrl) return;

    try {
      const response = await fetch(config.jwtAuthPublicKeyUrl);
      if (!response.ok) {
        console.warn(`Failed to refresh keys: ${response.statusText}`);
        return;
      }
      const data = (await response.json()) as {
        keys: { kid: string; publicKey: string }[];
      };
      if (data.keys?.length) {
        this.publicKeys = data.keys.map((key) => ({
          kid: key.kid,
          pem: `-----BEGIN PUBLIC KEY-----\n${key.publicKey}\n-----END PUBLIC KEY-----`,
        }));
        console.log(`✅ Refreshed ${this.publicKeys.length} public key(s)`);
      }
    } catch (error) {
      console.warn("⚠️  Failed to refresh public keys", error);
    }
  }
}
