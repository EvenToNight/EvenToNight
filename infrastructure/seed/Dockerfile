FROM node:25-alpine3.22

RUN apk add --no-cache docker-cli

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "seed"]