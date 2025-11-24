#!/bin/sh
# entrypoint.sh

# 1. Aplicar as migrações salvas (prontas para deploy)
echo "Rodando migrações do Prisma..."
npx prisma migrate deploy

# 2. Executar o Seeder (para popular SalesFunnelStage, se necessário)
# OBS: O seed deve ser idempotente (não deve duplicar dados)
echo "Rodando o Seeder do Prisma..."
npm run seed

# 3. Iniciar o servidor (o comando original do package.json)
echo "Iniciando o servidor..."
npm start