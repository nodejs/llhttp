FROM node:21-alpine@sha256:4999fa1391e09259e71845d3d0e9ddfe5f51ab30253c8b490c633f710c7446a0
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
