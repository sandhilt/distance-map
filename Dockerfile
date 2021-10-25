FROM node:14-alpine

ENV NPM_CONFIG_LOGLEVEL error

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
