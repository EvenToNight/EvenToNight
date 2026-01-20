FROM node:20-slim AS builder
WORKDIR /home/app

COPY ./services/payments/package.json ./ 
RUN npm install
COPY ./services/payments/tsconfig*.json ./services/payments/nest-cli.json ./
COPY ./services/payments/src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-slim AS runner
WORKDIR /home/app
COPY --from=builder /home/app/node_modules ./node_modules
COPY --from=builder /home/app/dist ./dist

USER node

EXPOSE 9050
CMD ["node", "dist/main.js"]
