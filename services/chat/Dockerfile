FROM node:20-slim AS builder
WORKDIR /home/app

COPY ./services/chat/package.json ./ 
RUN npm install
COPY ./services/chat/tsconfig*.json ./services/chat/nest-cli.json ./
COPY ./services/chat/src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-slim AS runner
WORKDIR /home/app
COPY --from=builder /home/app/node_modules ./node_modules
COPY --from=builder /home/app/dist ./dist

USER node

EXPOSE 9040
CMD ["node", "dist/main.js"]