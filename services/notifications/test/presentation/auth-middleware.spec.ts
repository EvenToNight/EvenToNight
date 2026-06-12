jest.mock("../../src/config/jwt.config", () => ({
  JwtService: { verifyToken: jest.fn() },
}));
jest.mock("../../src/config/env.config", () => ({
  config: { jwtAuthPublicKeyUrl: "http://keys" },
}));

import { createAuthMiddleware } from "../../src/notifications/presentation/middlewares/auth.middleware";
import { JwtService } from "../../src/config/jwt.config";
import { config } from "../../src/config/env.config";

// eslint-disable-next-line @typescript-eslint/unbound-method -- JwtService.verifyToken is a jest mock here
const verifyToken = JwtService.verifyToken as jest.Mock;
const flush = () => new Promise((r) => setImmediate(r));

const run = async (
  middleware: ReturnType<typeof createAuthMiddleware>,
  req: any,
) => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  middleware(req, res, next);
  await flush();
  return { res, next };
};

beforeEach(() => {
  verifyToken.mockReset();
  (config as any).jwtAuthPublicKeyUrl = "http://keys";
});

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("auth middleware", () => {
  it("skips authentication when no public key url is configured", async () => {
    (config as any).jwtAuthPublicKeyUrl = "";
    const { next, res } = await run(createAuthMiddleware(), {
      headers: {},
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejects with 401 when no token is provided", async () => {
    const { next, res } = await run(createAuthMiddleware(), { headers: {} });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("lets the request through when token is missing but auth is optional", async () => {
    const { next, res } = await run(createAuthMiddleware({ optional: true }), {
      headers: {},
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("sets req.userId and continues on a valid token", async () => {
    verifyToken.mockResolvedValue({ user_id: "u1" });
    const req: any = { headers: { authorization: "Bearer good" } };
    const { next } = await run(createAuthMiddleware(), req);
    expect(verifyToken).toHaveBeenCalledWith("good");
    expect(req.userId).toBe("u1");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("rejects with 401 when the token payload is invalid", async () => {
    verifyToken.mockResolvedValue(null);
    const { res, next } = await run(createAuthMiddleware(), {
      headers: { authorization: "Bearer bad" },
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects with 401 when verification throws", async () => {
    verifyToken.mockRejectedValue(new Error("kaboom"));
    const { res } = await run(createAuthMiddleware(), {
      headers: { authorization: "Bearer err" },
    });
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("continues on verification failure when auth is optional", async () => {
    verifyToken.mockRejectedValue(new Error("kaboom"));
    const { next } = await run(createAuthMiddleware({ optional: true }), {
      headers: { authorization: "Bearer err" },
    });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
