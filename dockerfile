# syntax=docker/dockerfile:1.7

# 1) Prod bağımlılıkları
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# 2) Build (TypeScript'i derle)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY .sequelizerc ./
# sequelize-cli ts config'i okuyacak
COPY src/db/config ./src/db/config
# derle
RUN npm run build

# 3) Runtime (küçük, güvenli)
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# runtime araçlar (pg bekleme için)
RUN apk add --no-cache bash curl netcat-openbsd

# prod node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# derlenmiş kod
COPY --from=build /app/dist ./dist

# sequelize-cli çalışırken migration/seed dosyalarına ihtiyaç duyar
COPY .sequelizerc ./
COPY config.js ./
COPY src/db/config ./src/db/config
COPY src/db/migrations ./src/db/migrations
COPY src/db/seeders ./src/db/seeders
COPY src/db/models ./src/db/models

# cli araçlarını kur (config.ts'yi okuyabilsin)
RUN npm i -g sequelize-cli ts-node typescript

# entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
EXPOSE 2000
CMD ["/entrypoint.sh"]
