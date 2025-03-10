FROM node:23-alpine@sha256:dc4d20572e425f9d4c68a6f9c382fbcfec3fa2f8ef0b12cb1d96feabdb479a48
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
