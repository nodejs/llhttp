FROM node:22-alpine@sha256:3bb8914774985da457e08ca85654fecc062a206807d6225ede5b9b4e7465e733
ARG UID=1000
ARG GID=1000

RUN apk add -U clang lld wasi-sdk && mkdir /home/node/llhttp

WORKDIR /home/node/llhttp

COPY . .

RUN npm ci

USER node
