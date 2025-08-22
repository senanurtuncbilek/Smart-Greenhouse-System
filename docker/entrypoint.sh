#!/bin/sh
set -e

echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."
until nc -z "$DB_HOST" "$DB_PORT"; do sleep 1; done
echo "Postgres is up."

# Migrations
npx sequelize-cli db:migrate

# Opsiyonel seed (RUN_SEED=1 yaparsan)
if [ "${RUN_SEED:-0}" = "1" ]; then
  npx sequelize-cli db:seed:all || true
fi

# API'yi başlat (dist üzerinden)
node dist/server.js
