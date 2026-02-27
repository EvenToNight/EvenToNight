export const TICKETING_SERVICE_BASE_URL = process.env.HOST
  ? `http://ticketing.${process.env.HOST}`
  : `http://localhost:${process.env.TICKETING_SERVICE_PORT}`;
