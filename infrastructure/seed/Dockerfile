FROM node:25-alpine3.22
WORKDIR /app

RUN apk add --no-cache docker-cli

COPY ./infrastructure/seed/package.json ./
RUN npm install

COPY ./infrastructure/seed/tsconfig.json ./
COPY ./infrastructure/seed/src ./src

CMD ["npm", "run", "seed:generate"]