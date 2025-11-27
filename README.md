"# use-Track-Backend" 

# Simple API Rest in Typecript 
Este projeto consiste em uma API REST simples desenvolvida com TypeScript, focada em demonstrar a estrutura básica de um backend moderno. Utiliza Node.js, Express e práticas recomendadas de tipagem e organização de código, sendo ideal para quem está começando no desenvolvimento de APIs com TypeScript.

### 🛠️ Tools
[![Node](https://img.shields.io/badge/Node-339933?logo=node.js&logoColor=white)](https://nodejs.org/es/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/es/)
[![Typescript](https://img.shields.io/badge/Typescript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/sqlite-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)
[![Eslint](https://img.shields.io/badge/Eslint-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)

<br>

## How to use<br>
<br>

### Step 1: Clone the project 
Em primeiro lugar precisamos clonar ou baixar o projeto localmente, para isso usaremos o seguinte comando: 
```
git clone 'https://github.com/AlexandreBnovais/TCC-backend.git'
```
Em seguida entre no diretorio 
```
cd TCC-backend
```
<br>

### Step 2: Install dependency
Agora precisamos instalar as dependencias de desenvolvimento do projeto. Para isso usaremos o gerenciador de pacotes "npm".
```
npm install
```
**Dica**: para verificar se a instalação deu certo identifique se o projeto gerou a pasta "node_modules" e o arquivo "package-look.json"

<br>

### Step 3: Creating environment variables
Esta etapa define a criação das variaveis de ambientes necessarias para API.
1. Crie um arquivo .env
2. Copie todas as variaveis de ambiente do arquivo de exemplo (.env.example) e cole-as no seu arquivo .env.
3. Preencha o nome do HOST e a PORTA que você irá usar (ex: APP_HOST='localhost' e APP_PORT=8000)

<br>

### Step 4: Creating a Signature Token
Após incluir valores para as variaveis "host" e "port", precisamos criar uma chave de assinatura para o Json Web Token (JWT). 
Para criar um chave de assinatura usaremos a libs require("crypto")

1. No seu terminal de comando digite: 
```
node 
```
2. Depois digite a seguinte estrutura:
```ruby
const crypto = require('crypto'); crypto.randomBytes(16).toString('hex')
```
3. Copie o hash gerado e cole na variavel de ambiente "JWT_SECRET"

<br>

### Step 5: Build your application
Nesta etapa construiremos nossas migrations assim com nosso banco de dados local.
Usaremos o seguinte comando
```
npm run migrate
```
Depois gere o prisma client e a pasta ./dist
```
npm run build
```


# ===========================
# 1. STAGE DE BUILD
# ===========================
FROM node:20-alpine AS build

WORKDIR /app

# Instala TODAS as dependências (incluindo dev)
COPY package*.json ./
RUN npm install

# Copia prisma + src para gerar Prisma Client corretamente
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Gera Prisma Client antes da build
RUN npx prisma generate

# Compila o TypeScript
RUN npm run build



# ===========================
# 2. STAGE FINAL (PRODUÇÃO)
# ===========================
FROM node:20-alpine AS final

ENV NODE_ENV=production
ENV PORT=8000

WORKDIR /app

# Copia apenas os package.json para instalar somente prod
COPY package*.json ./

# Instala apenas dependências necessárias PARA PRODUÇÃO
RUN npm install --omit=dev

# Copia o código buildado
COPY --from=build /app/build ./build

# Copia Prisma Client gerado no build
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Copia schema Prisma (necessário para migrations em runtime)
COPY --from=build /app/prisma ./prisma

# Copia entrypoint (para migrations/seed antes do start)
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]

# Comando padrão para iniciar a API
CMD ["npm", "start"]



### entrypoint

#!/bin/sh
set -e

echo "🔄 Rodando Prisma Migrate..."
npm run migrate:deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Rodando Seeds..."
  npm run seed
else
  echo "🌱 Seed ignorado (defina RUN_SEED=true para ativar)"
fi

echo "🚀 Iniciando o servidor..."
exec npm start


### ENV
RUN_SEED=true


### server.js

```ruby
import { createServer } from "http";
import { app } from "./app.js";
import "dotenv/config";

const server = createServer(app);

// Railway/Render sempre enviam process.env.PORT
const PORT = process.env.PORT || process.env.APP_PORT || 3000;

// Deve sempre ser 0.0.0.0 em containers
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

process.on("SIGINT", () => {
    console.log("server closing...");
    server.close((err) => {
        if (err) {
            console.error("Error closing server", err);
            process.exit(1);
        }
        console.log("Server closed");
        process.exit(0);
    });
});

```
