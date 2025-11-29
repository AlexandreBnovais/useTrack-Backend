#############################################
# 1. STAGE DE BUILD
#############################################
FROM node:20-alpine AS build

WORKDIR /app

# Copia apenas os arquivos essenciais primeiro para cache
COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Gera Prisma Cliente antes da build
RUN npx prisma generate

# Compila o TypeScript
RUN npm run build



#############################################
# 2. STAGE FINAL (PRODUÇÃO)
#############################################
FROM node:20-alpine AS final

ENV NODE_ENV=production
ENV PORT=3000

ENV ADMIN_USER_ID='4b397fc5-54b9-4e0e-924f-693ead541a36'

# SIGNATURE TOKEN 
ENV ACESS_TOKEN_SECRET='sWph+sRms5JtuXRAAT1t1FlEqpGrh1y7Luzgh8ovV98='
ENV REFRESH_TOKEN_SECRET='d88a0d6e0624f07d210196c26e32ea290efd779f29c9cf81bba26c096402960d'

ENV RUN_SEED=true

# DATABASE ENVIRONMENT
ENV DATABASE_URL="file:./database/database.db"

WORKDIR /app

COPY package*.json ./

# Instala apenas dependências de produção
RUN npm install --omit=dev

# Copia código compilado
COPY --from=build /app/build ./build

# Copia Prisma Client
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Copia schema Prisma (para migrations/seed)
COPY --from=build /app/prisma ./prisma

# Entrypoint
COPY entrypoint.sh /usr/local/bin/
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

EXPOSE 3000

CMD ["node", "build/server.js"]
