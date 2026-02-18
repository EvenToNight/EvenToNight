FROM node:20-alpine
RUN apk add --no-cache curl
WORKDIR /app

COPY ./services/media/package*.json ./
RUN npm ci

COPY ./services/media/src ./src
COPY ./services/media/tsconfig.json ./
COPY ./services/media/res ./res

RUN npm run build

EXPOSE 9020

CMD ["npm", "start"]