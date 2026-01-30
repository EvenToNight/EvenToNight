FROM node:25-alpine3.22 AS builder
WORKDIR /home/app

COPY ./services/frontend/package.json ./
RUN apk add --no-cache git
RUN npm install --include=dev
COPY ./services/frontend .

ENV NODE_ENV=production
ARG HOST="eventonight.site"
ENV VITE_HOST=${HOST}
ARG USE_HTTPS=true
ENV VITE_USE_HTTPS=${USE_HTTPS}
ENV VITE_USE_MOCK_API=false

RUN npm run build
RUN npm prune --omit=dev

FROM node:25-alpine3.22
WORKDIR /home/app
ENV PORT=3000
COPY --from=builder /home/app/dist ./dist
COPY --from=builder /home/app/node_modules ./node_modules
RUN npm install -g serve@14.2.5
ENTRYPOINT serve -s dist --no-clipboard -l ${PORT}