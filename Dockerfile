FROM node:12.14.1-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json ./

USER node

RUN npm install --production

COPY --chown=node:node . .

RUN ls -la && cat .git/HEAD && git submodule update --init

CMD [ "npm", "start" ]