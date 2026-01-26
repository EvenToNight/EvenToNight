import dotenv from 'dotenv';
import { join } from 'path/win32';

const envFromRoot: Record<string, string> = {};
dotenv.config({
  path: join(__dirname, '..', '..', '..', '.env'),
  processEnv: envFromRoot,
});

if (
  !process.env.NOTIFICATIONS_SERVICE_PORT &&
  envFromRoot['NOTIFICATIONS_SERVICE_PORT']
) {
  process.env.NOTIFICATIONS_SERVICE_PORT = envFromRoot['NOTIFICATIONS_SERVICE_PORT'];
}

if (
  process.env.ENV === 'development' &&
  !process.env.RABBITMQ_USER &&
  envFromRoot['RABBITMQ_USER']
) {
  process.env.RABBITMQ_USER = envFromRoot['RABBITMQ_USER'];
}

if (
  process.env.ENV === 'development' &&
  !process.env.RABBITMQ_PASS &&
  envFromRoot['RABBITMQ_PASS']
) {
  process.env.RABBITMQ_PASS = envFromRoot['RABBITMQ_PASS'];
}

export const config = {
  port: process.env.NOTIFICATIONS_SERVICE_PORT!,
  mongodbUri: `mongodb://${process.env.MONGO_HOST}:27017/eventonight-notifications` || 'mongodb://localhost:27017/notifications',
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    user: process.env.RABBITMQ_USER || 'guest',
    pass: process.env.RABBITMQ_PASS || 'guest',
    exchange: 'eventonight',
    queue: 'notifications_queue',
    get url(): string {
      return `amqp://${this.user}:${this.pass}@${this.host}:5672`;
    },
  },
};
