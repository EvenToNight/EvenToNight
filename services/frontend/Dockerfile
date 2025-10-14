FROM node:alpine3.21 AS builder
WORKDIR /home/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:alpine3.21
WORKDIR /home/app
COPY --from=builder /home/app/dist ./dist
COPY --from=builder /home/app/node_modules ./node_modules
EXPOSE $PORT
RUN npm install -g serve@14.2.4
ENTRYPOINT serve -s dist -l $PORT --no-clipboard