jest.mock("amqp-connection-manager", () => ({
  __esModule: true,
  default: { connect: jest.fn() },
}));

import amqp from "amqp-connection-manager";
import { RabbitMQConsumer } from "../../src/notifications/presentation/consumers/rabbitmq.consumer";

const connect = amqp.connect as jest.Mock;
const flush = () => new Promise((r) => setImmediate(r));

const routerMock = () => ({ route: jest.fn().mockResolvedValue(undefined) });

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => undefined);
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});
beforeEach(() => connect.mockReset());

describe("RabbitMQConsumer", () => {
  const wireConnection = () => {
    let setupFn: (channel: any) => Promise<void>;
    const channelWrapper = {
      waitForConnect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };
    const connection = {
      on: jest.fn(),
      createChannel: jest.fn().mockImplementation(({ setup }) => {
        setupFn = setup;
        return channelWrapper;
      }),
      close: jest.fn().mockResolvedValue(undefined),
    };
    connect.mockReturnValue(connection);
    return { connection, channelWrapper, getSetup: () => setupFn };
  };

  it("connects, registers lifecycle handlers and starts consuming", async () => {
    const router = routerMock();
    const { connection, getSetup } = wireConnection();
    const consumer = new RabbitMQConsumer(router as any);

    await consumer.connect();

    expect(connect).toHaveBeenCalledTimes(1);
    // exercise the lifecycle callbacks
    connection.on.mock.calls.forEach(([, cb]: [string, any]) =>
      cb(new Error("evt")),
    );

    // run the channel setup → startConsuming
    const channel = {
      prefetch: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn().mockResolvedValue(undefined),
      ack: jest.fn(),
      nack: jest.fn(),
    };
    await getSetup()(channel);
    expect(channel.prefetch).toHaveBeenCalledWith(1);
    expect(channel.consume).toHaveBeenCalledTimes(1);

    // invoke the consume callback with null and with a message
    const onMsg = channel.consume.mock.calls[0][1];
    expect(onMsg(null)).toBeUndefined();
    onMsg({
      content: Buffer.from(JSON.stringify({ payload: { a: 1 } })),
      fields: { routingKey: "event.published" },
    });
    await flush();
  });

  it("rethrows when the initial connection fails", async () => {
    const router = routerMock();
    connect.mockImplementation(() => {
      throw new Error("no broker");
    });
    await expect(new RabbitMQConsumer(router as any).connect()).rejects.toThrow(
      "no broker",
    );
  });

  it("acks a message after routing it successfully", async () => {
    const router = routerMock();
    const consumer = new RabbitMQConsumer(router as any);
    const channel = { ack: jest.fn(), nack: jest.fn() };
    const msg = {
      content: Buffer.from(JSON.stringify({ payload: { x: 1 } })),
      fields: { routingKey: "chat.message.created" },
    };

    await (consumer as any).processMessage(
      channel,
      msg,
      "chat.message.created",
    );

    expect(router.route).toHaveBeenCalledWith("chat.message.created", { x: 1 });
    expect(channel.ack).toHaveBeenCalledWith(msg);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it("nacks a message when routing throws", async () => {
    const router = routerMock();
    router.route.mockRejectedValue(new Error("route fail"));
    const consumer = new RabbitMQConsumer(router as any);
    const channel = { ack: jest.fn(), nack: jest.fn() };
    const msg = {
      content: Buffer.from(JSON.stringify({ payload: {} })),
      fields: { routingKey: "x" },
    };

    await (consumer as any).processMessage(channel, msg, "x");

    expect(channel.nack).toHaveBeenCalledWith(msg, false, false);
    expect(channel.ack).not.toHaveBeenCalled();
  });

  it("closes channel and connection", async () => {
    const router = routerMock();
    const { channelWrapper, connection } = wireConnection();
    const consumer = new RabbitMQConsumer(router as any);
    await consumer.connect();

    await consumer.close();

    expect(channelWrapper.close).toHaveBeenCalled();
    expect(connection.close).toHaveBeenCalled();
  });
});
