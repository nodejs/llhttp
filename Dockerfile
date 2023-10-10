FROM node:18-alpine@sha256:a315556d82ef54561e54fca7d8ee333382de183d4e56841dcefcd05b55310f46
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
