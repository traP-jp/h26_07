# syntax=docker/dockerfile:1

FROM node:24.17.0-bookworm-slim AS builder

WORKDIR /src

ENV CI=true

RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build-only && pnpm run type-check

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /src/dist /usr/share/nginx/html

EXPOSE 8080
