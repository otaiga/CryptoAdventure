FROM node:14-alpine

RUN apk update
RUN apk add python3 make g++ && ln -sf python3 /usr/bin/python
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json ./

COPY package-lock.json ./

USER node

RUN npm ci

COPY --chown=node:node . .

CMD [ "node", "app.js" ]
