FROM node:23-alpine@sha256:b20f8fad528b0e768936cb88ccb7b0e37cf41587d177e2d6fcdbd48bb4e083ec
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
