FROM node:20-slim AS builder
WORKDIR /home/app

COPY ./services/notifications/package.json ./
RUN npm install
COPY ./services/notifications/tsconfig.json ./
COPY ./services/notifications/src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-slim AS runner
WORKDIR /home/app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /home/app/node_modules ./node_modules
COPY --from=builder /home/app/dist ./dist

USER node

EXPOSE 9060
CMD ["node", "dist/index.js"]
