FROM node:25-alpine@sha256:809972647175c30a4c7763d3e6cc064dec588972af57e540e5a6f27442bb0845
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
