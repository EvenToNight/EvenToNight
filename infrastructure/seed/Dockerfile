FROM node:25-alpine3.22
WORKDIR /app

RUN apk add --no-cache python3 make g++ && npm install -g mongosh && apk del make g++

COPY ./infrastructure/seed/package*.json ./
RUN npm ci

COPY ./infrastructure/seed/tsconfig.json ./
COPY ./infrastructure/seed/src ./src

CMD ["npm", "run", "seed"]