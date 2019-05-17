FROM node:10-slim

RUN mkdir /app

WORKDIR /app

COPY package.json .

RUN npm install

COPY src src
COPY server server
COPY bin/ocwa-scanner /usr/local/bin/ocwa-scanner

EXPOSE 3000