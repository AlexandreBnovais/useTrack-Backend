#!/bin/sh
# entrypoint.sh

echo "Rodando migrações do Prisma..."
npm run migrate:deploy # 1. Aplica as migrações (cria as tabelas)

echo "Rodando o Seeder do Prisma..."
npm run seed # 2. Popula SalesFunnelStage (evita o erro P2003 de Lead)

echo "Iniciando o servidor..."
npm start # 3. Inicia o servidor Express