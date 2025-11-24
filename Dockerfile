# 1. FASE DE BUILD: Compilação do TypeScript e Geração do Prisma Client
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compila o TypeScript para JavaScript
RUN npm run build

# Otimiza o Prisma para a arquitetura de produção
RUN npx prisma generate

# 2. FASE DE PRODUÇÃO: Imagem final, mais leve e segura
FROM node:20-alpine AS final

ENV NODE_ENV=production
ENV PORT=8000

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# Copia código compilado, Prisma Client e schema
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY prisma ./prisma

# Copia o script de entrada e o torna executável
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Define o ENTRYPOINT para rodar o script
ENTRYPOINT ["entrypoint.sh"] 

# O CMD é a instrução padrão. Não é estritamente necessário se ENTRYPOINT for usado,
# mas mantemos para clareza ou fallback. O ENTRYPOINT acima já inclui o 'npm start'.
CMD ["npm", "start"]