FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

EXPOSE 9030

CMD ["npm", "start"]