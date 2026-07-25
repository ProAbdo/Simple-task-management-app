FROM node:22-bookworm-slim AS development-dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM development-dependencies AS build

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=node:node /app/dist ./dist

RUN mkdir -p /app/storage/uploads && chown -R node:node /app/storage

USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
