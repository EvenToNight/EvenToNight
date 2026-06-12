jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    connection: { on: jest.fn() },
  },
}));
jest.mock("amqplib", () => ({ connect: jest.fn() }));
jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: { decode: jest.fn(), verify: jest.fn() },
}));

import mongoose from "mongoose";
import * as amqp from "amqplib";
import jwt from "jsonwebtoken";
import { config } from "../../src/config/env.config";
import { MongoDB } from "../../src/config/mongodb.config";
import { RabbitMQ } from "../../src/config/rabbitmq.config";
import { JwtService } from "../../src/config/jwt.config";

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => undefined);
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("env config", () => {
  it("exposes a config object with sensible defaults", () => {
    expect(config.mongodbUri).toMatch(/^mongodb:\/\//);
    expect(config.rabbitmq.url).toMatch(/^amqp:\/\//);
    expect(config.rabbitmq.exchange).toBe("eventonight");
    expect(config.rabbitmq.queue).toBe("notifications_queue");
  });
});

describe("MongoDB", () => {
  it("connects using the configured uri", async () => {
    await MongoDB.connect();
    expect((mongoose as any).connect).toHaveBeenCalledWith(config.mongodbUri);
  });

  it("rethrows connection errors", async () => {
    ((mongoose as any).connect as jest.Mock).mockRejectedValueOnce(
      new Error("conn fail"),
    );
    await expect(MongoDB.connect()).rejects.toThrow("conn fail");
  });

  it("disconnects", async () => {
    await MongoDB.disconnect();
    expect((mongoose as any).disconnect).toHaveBeenCalled();
  });
});

describe("RabbitMQ", () => {
  it("declares the exchange, queue and all routing-key bindings", async () => {
    const channel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue(undefined),
      bindQueue: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };
    const connection = {
      createChannel: jest.fn().mockResolvedValue(channel),
      close: jest.fn().mockResolvedValue(undefined),
    };
    (amqp.connect as jest.Mock).mockResolvedValue(connection);

    await RabbitMQ.setup();

    expect(channel.assertExchange).toHaveBeenCalledWith(
      "eventonight",
      "topic",
      { durable: true },
    );
    expect(channel.bindQueue).toHaveBeenCalledTimes(6);
    expect(connection.close).toHaveBeenCalled();
  });

  it("rethrows when the broker is unreachable", async () => {
    (amqp.connect as jest.Mock).mockRejectedValueOnce(new Error("amqp down"));
    await expect(RabbitMQ.setup()).rejects.toThrow("amqp down");
  });
});

describe("JwtService (no public key url configured)", () => {
  it("initialize is a no-op", async () => {
    await expect(JwtService.initialize()).resolves.toBeUndefined();
  });

  it("verifyToken decodes the token without verifying the signature", async () => {
    (jwt.decode as jest.Mock).mockReturnValue({ user_id: "u1", exp: 123 });
    const payload = await JwtService.verifyToken("some.token");
    expect(payload).toEqual({ user_id: "u1", exp: 123 });
    expect(jwt.decode).toHaveBeenCalledWith("some.token");
  });
});
