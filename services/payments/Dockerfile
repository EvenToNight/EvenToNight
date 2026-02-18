FROM node:20-slim AS ts-common-builder
WORKDIR /home/app/libs/ts-common

COPY ./libs/ts-common/package*.json ./
RUN npm ci

COPY ./libs/ts-common/tsconfig.json ./
COPY ./libs/ts-common/src ./src
RUN npm run build

FROM node:20-slim AS nestjs-common-builder
WORKDIR /home/app

COPY --from=ts-common-builder /home/app/libs/ts-common ./libs/ts-common

WORKDIR /home/app/libs/nestjs-common
COPY ./libs/nestjs-common/package*.json ./
RUN npm ci

COPY ./libs/nestjs-common/tsconfig*.json ./
COPY ./libs/nestjs-common/src ./src
RUN npm run build

FROM node:20-slim AS builder
WORKDIR /home/app

COPY --from=ts-common-builder /home/app/libs/ts-common ./libs/ts-common
COPY --from=nestjs-common-builder /home/app/libs/nestjs-common ./libs/nestjs-common

WORKDIR /home/app/services/payments

COPY ./services/payments/package*.json ./

RUN npm ci

COPY ./services/payments/tsconfig*.json ./services/payments/nest-cli.json ./
COPY ./services/payments/src ./src
RUN npm run build
RUN npm prune --omit=dev

RUN rm -rf node_modules/@libs/ts-common node_modules/@libs/nestjs-common
COPY --from=ts-common-builder /home/app/libs/ts-common/dist ./node_modules/@libs/ts-common/dist
COPY --from=ts-common-builder /home/app/libs/ts-common/package.json ./node_modules/@libs/ts-common/package.json
COPY --from=nestjs-common-builder /home/app/libs/nestjs-common/dist ./node_modules/@libs/nestjs-common/dist
COPY --from=nestjs-common-builder /home/app/libs/nestjs-common/package.json ./node_modules/@libs/nestjs-common/package.json

FROM node:20-slim AS runner
WORKDIR /home/app
COPY --from=builder /home/app/services/payments/node_modules ./node_modules
COPY --from=builder /home/app/services/payments/dist ./dist

USER node

EXPOSE 9050
CMD ["node", "dist/main.js"]
