import { requireEnv } from './_env'
// Fixe les prix des articles du Store (prix coûtant en DH).
// Usage : npx tsx scripts/store-set-prices.ts          → base locale
//         npx tsx scripts/store-set-prices.ts --prod   → production (une fois les vrais prix validés)

import { PrismaClient } from '@prisma/client'

const isProd = process.argv.includes('--prod')
const db = new PrismaClient({ datasourceUrl: isProd ? requireEnv('PROD_DATABASE_URL') : requireEnv('DATABASE_URL') })

const PRICES: Record<string, number> = {
  'tshirt-running':          100,
  'debardeur-homme':          80,
  'debardeur-femme':          80,
  'tunique-manches-longues': 150,
  'bonnet-sport':             60,
  'casquette':                60,
  'lunettes':                120,
  'manchettes':               70,
  'chaussettes':              80,
  'bracelets':                30,
  'ceinture-running':        120,
  'soft-flask':               70,
  'serviette-running':        80,
}

async function main() {
  console.log(`💰 Prix du Store sur ${isProd ? 'PRODUCTION' : 'LOCAL'}\n`)
  for (const [slug, price] of Object.entries(PRICES)) {
    const r = await (db as any).storeProduct.updateMany({ where: { slug }, data: { price } })
    console.log(`  ${r.count ? '✓' : '✗ introuvable'}  ${slug.padEnd(24)} ${price} DH`)
  }
  console.log('\n✅ Terminé')
}
main().catch(e => { console.error('❌', e); process.exit(1) }).finally(() => db.$disconnect())
