// ⚠️  DESTRUCTIF — Supprime TOUS les paiements (local + prod).
//
// Usage :
//   npx tsx scripts/reset-all-payments.ts --local-only
//   npx tsx scripts/reset-all-payments.ts --prod-only
//   npx tsx scripts/reset-all-payments.ts --both
//
// Protection : nécessite d'avoir la variable d'env RESET_CONFIRM="OUI_JE_SUPPRIME_TOUT"
// pour effectivement exécuter la suppression.

import { PrismaClient } from '@prisma/client'

const PROD_URL  = 'postgresql://neondb_owner:npg_F4WBLe6rxZTm@ep-sweet-unit-amybnzup-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const LOCAL_URL = 'postgresql://postgres:Major@localhost:5432/clubmajor'

const CONFIRM_TOKEN = 'OUI_JE_SUPPRIME_TOUT'

async function wipePayments(client: PrismaClient, label: string) {
  console.log(`\n--- ${label} ---`)
  const before = await client.payment.count()
  console.log(`Avant : ${before} paiement(s) en base.`)

  const deleted = await client.payment.deleteMany({})
  console.log(`✅ Supprim\xE9 : ${deleted.count} ligne(s).`)

  const after = await client.payment.count()
  console.log(`Après : ${after} paiement(s).`)
}

async function main() {
  const args    = process.argv.slice(2)
  const doLocal = args.includes('--local-only') || args.includes('--both')
  const doProd  = args.includes('--prod-only')  || args.includes('--both')

  if (!doLocal && !doProd) {
    console.error('❌ Précise --local-only, --prod-only ou --both')
    process.exit(1)
  }

  if (process.env.RESET_CONFIRM !== CONFIRM_TOKEN) {
    console.error('⚠️  Variable d\'env de confirmation manquante.')
    console.error(`    Relance avec :  $env:RESET_CONFIRM="${CONFIRM_TOKEN}"; npx tsx scripts/reset-all-payments.ts <flags>`)
    console.error('    (ou export RESET_CONFIRM=... sur Bash)')
    process.exit(1)
  }

  console.log('⚠️  SUPPRESSION DEFINITIVE DES PAIEMENTS')
  console.log(`   • Local : ${doLocal ? 'OUI' : 'non'}`)
  console.log(`   • Prod  : ${doProd  ? 'OUI' : 'non'}\n`)

  if (doLocal) {
    const local = new PrismaClient({ datasourceUrl: LOCAL_URL })
    try { await wipePayments(local, 'LOCAL (localhost:5432)') }
    finally { await local.$disconnect() }
  }

  if (doProd) {
    const prod = new PrismaClient({ datasourceUrl: PROD_URL })
    try { await wipePayments(prod, 'PROD (Neon)') }
    finally { await prod.$disconnect() }
  }

  console.log('\n✅ Reset termin\xE9.')
}

main().catch(e => { console.error('❌ Erreur :', e); process.exit(1) })
