#!/bin/sh
set -e

echo "🔄 Aguardando conexão com o banco..."

echo "🔄 Rodando Prisma Migrate..."
npm run migrate:deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Rodando Seeds..."
  npm run seed
else
  echo "🌱 Seed ignorado (defina RUN_SEED=true para ativarr)"
fi

echo "🚀 Iniciando o servidor..."
exec npm start -- "$@"
