FROM node:23-alpine@sha256:86703151a18fcd06258e013073508c4afea8e19cd7ed451554221dd00aea83fc
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
