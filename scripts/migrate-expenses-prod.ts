// Migration prod : ajoute la table `expenses` et les enums `ExpenseCategory`
// et `ExpensePaymentMethod` sur Neon.
//
// Usage : npx tsx scripts/migrate-expenses-prod.ts
// Idempotent (CREATE TYPE IF NOT EXISTS via DO + CREATE TABLE IF NOT EXISTS).

import { PrismaClient } from '@prisma/client'

const PROD_URL = 'postgresql://neondb_owner:npg_F4WBLe6rxZTm@ep-sweet-unit-amybnzup-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const prod = new PrismaClient({ datasourceUrl: PROD_URL })

async function main() {
  console.log('🔄 Migration dépenses sur PROD…\n')

  console.log('1) Création des enums ExpenseCategory et ExpensePaymentMethod…')
  await prod.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "ExpenseCategory" AS ENUM (
        'TRAINING_WATER','TRAINING_FRUITS','TRAINING_EQUIPMENT',
        'EVENT_TRANSPORT','EVENT_HAMMAM','EVENT_MEAL','EVENT_REFRESHMENT',
        'EVENT_REGISTRATION','EVENT_ACCOMMODATION',
        'EQUIPMENT_COLLECTIVE','EQUIPMENT_UNIFORM',
        'COMMUNICATION','ADMINISTRATION','OTHER'
      );
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await prod.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "ExpensePaymentMethod" AS ENUM ('CASH','BANK_TRANSFER','CHECK','CARD');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  console.log('   ✅ Enums présents.')

  console.log('\n2) Création de la table expenses…')
  await prod.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "expenses" (
      "id"                TEXT                      PRIMARY KEY,
      "amount"            DOUBLE PRECISION          NOT NULL,
      "date"              TIMESTAMP(3)              NOT NULL,
      "category"          "ExpenseCategory"         NOT NULL,
      "description"       TEXT                      NOT NULL,
      "supplier"          TEXT,
      "paymentMethod"     "ExpensePaymentMethod"    NOT NULL DEFAULT 'CASH',
      "receiptUrl"        TEXT,
      "notes"             TEXT,
      "eventId"           TEXT,
      "trainingSessionId" TEXT,
      "recordedById"      TEXT                      NOT NULL,
      "createdAt"         TIMESTAMP(3)              NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"         TIMESTAMP(3)              NOT NULL
    )
  `)
  await prod.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "expenses_date_idx"     ON "expenses"("date")`)
  await prod.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "expenses_category_idx" ON "expenses"("category")`)
  await prod.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "expenses_eventId_idx"  ON "expenses"("eventId")`)
  console.log('   ✅ Table expenses présente.')

  console.log('\n3) FK vers users / events / training_sessions…')
  await prod.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "expenses"
        ADD CONSTRAINT "expenses_recordedById_fkey"
        FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await prod.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "expenses"
        ADD CONSTRAINT "expenses_eventId_fkey"
        FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await prod.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "expenses"
        ADD CONSTRAINT "expenses_trainingSessionId_fkey"
        FOREIGN KEY ("trainingSessionId") REFERENCES "training_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  console.log('   ✅ FK en place.')

  const count = await prod.$queryRawUnsafe<Array<{ c: number }>>(`SELECT COUNT(*)::int AS c FROM "expenses"`)
  console.log(`\n✅ Migration terminée. ${count[0].c} dépense(s) en prod.`)
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(() => prod.$disconnect())
