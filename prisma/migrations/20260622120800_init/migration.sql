-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "amountAed" REAL NOT NULL,
    "merchant" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "person" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
    "rawInput" TEXT,
    "items" TEXT,
    "confidence" REAL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "month" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "person" TEXT NOT NULL,
    "limitAed" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "RecurringPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "merchant" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "person" TEXT NOT NULL,
    "avgAmountAed" REAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "lastSeen" DATETIME NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1
);

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_person_idx" ON "Expense"("person");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_month_category_person_key" ON "Budget"("month", "category", "person");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringPattern_merchant_person_key" ON "RecurringPattern"("merchant", "person");
