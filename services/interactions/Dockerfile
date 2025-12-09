FROM node:20-slim AS builder
WORKDIR /home/app

COPY ./services/interactions/package.json ./services/interactions/package-lock.json* ./ 
RUN npm ci
COPY ./services/interactions/tsconfig*.json ./services/interactions/nest-cli.json ./
COPY ./services/interactions/src ./src
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /home/app
COPY ./services/interactions/package.json ./services/interactions/package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /home/app/dist ./dist

USER node

EXPOSE 9030
CMD ["node", "dist/main.js"]
