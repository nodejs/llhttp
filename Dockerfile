FROM node:23-alpine@sha256:70eca392e3d52cb7d133b52d52e8600d8c410a5eaee6105c11324b28868f9ac9
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
