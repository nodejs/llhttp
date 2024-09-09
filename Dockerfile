FROM node:22-alpine@sha256:bec0ea49c2333c429b62e74e91f8ba1201b060110745c3a12ff957cd51b363c6
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
