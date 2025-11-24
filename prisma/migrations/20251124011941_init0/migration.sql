-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "refreshTokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "expiryDate" INTEGER,
    "userEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "refreshTokens_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "users" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "googleUsers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pictureUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "googleRefreshTokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tokenId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "googleRefreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "googleUsers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT
);

-- CreateTable
CREATE TABLE "salesFunnelStages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sellerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "stageId" INTEGER NOT NULL,
    "nextFollowUpDate" DATETIME,
    CONSTRAINT "leads_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "leads_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "leads_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "salesFunnelStages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "followups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notes" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "leadId" TEXT NOT NULL,
    "registeredById" TEXT,
    CONSTRAINT "followups_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "followups_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refreshTokens_userEmail_key" ON "refreshTokens"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "googleUsers_email_key" ON "googleUsers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "googleRefreshTokens_tokenId_key" ON "googleRefreshTokens"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "googleRefreshTokens_userId_key" ON "googleRefreshTokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "salesFunnelStages_name_key" ON "salesFunnelStages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "salesFunnelStages_order_key" ON "salesFunnelStages"("order");
