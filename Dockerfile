FROM node:22-alpine@sha256:ed9736a13b88ba55cbc08c75c9edac8ae7f72840482e40324670b299336680c1
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk bash && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
