FROM node:20-alpine
WORKDIR /app

COPY ./services/media/package*.json ./
RUN npm install

COPY ./services/media/src ./src
COPY ./services/media/tsconfig.json ./

RUN npm run build

EXPOSE 9030

CMD ["npm", "start"]