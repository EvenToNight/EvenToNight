FROM node:25-alpine3.22 AS builder
WORKDIR /home/app

COPY ./services/frontend/package.json ./
RUN npm install
COPY ./services/frontend .
ENV NODE_ENV=production
ARG VITE_HOST
ENV VITE_HOST=${VITE_HOST}
ENV VITE_USE_MOCK_API=true
RUN npm run build
RUN npm prune --omit=dev

FROM node:25-alpine3.22
WORKDIR /home/app
ARG PORT
ENV PORT=${PORT}
COPY --from=builder /home/app/dist ./dist
COPY --from=builder /home/app/node_modules ./node_modules
RUN npm install -g serve@14.2.5
ENTRYPOINT serve -s dist --no-clipboard -l ${PORT}