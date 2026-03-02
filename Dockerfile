FROM node:25-alpine@sha256:18e02657e2a2cc3a87210ee421e9769ff28a1ac824865d64f74d6d2d59f74b6b
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
