FROM node:22-alpine@sha256:94567107148ac59f1eb2ad9b7c1db03f1a1a12d28717b29eda0535aa3bd2f71e
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
