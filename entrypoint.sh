#!/bin/sh
set -e

echo "🔄 Aguardando conexão com o banco..."

# tenta conectar ao DB com retry
until npx prisma db pull >/dev/null 2>&1; do
  echo "⏳ Banco indisponível, tentando novamente..."
  sleep 2
done

echo "🔄 Rodando Prisma Migrate..."
npm run migrate:deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Rodando Seeds..."
  npm run seed
else
  echo "🌱 Seed ignorado (defina RUN_SEED=true para ativar)"
fi

echo "🚀 Iniciando o servidor..."
exec npm start -- "$@"
