export const PAYMENT_SERVICE_BASE_URL = process.env.HOST
  ? `http://payments.${process.env.HOST}`
  : `http://localhost:${process.env.PAYMENTS_SERVICE_PORT}`;
