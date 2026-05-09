// Migre l'ancien champ scalaire `motivation` vers le tableau `motivations`.
// À exécuter UNE FOIS après l'ajout du champ `motivations[]` dans le schema.
//
// Usage:
//   npx tsx scripts/migrate-motivations-to-array.ts
//
// Idempotent : ne touche que les membres dont `motivation` est non null
// ET dont `motivations` est vide. Les membres déjà migrés sont ignorés.

import { prisma } from '../lib/prisma'

async function main() {
  // SQL direct — ne dépend pas du Prisma Client typé
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "members"
       SET "motivations" = ARRAY["motivation"]::"MotivationGoal"[]
     WHERE "motivation" IS NOT NULL
       AND ("motivations" IS NULL OR cardinality("motivations") = 0)
  `)
  console.log(`✅ ${result} membre(s) migré(s) vers le tableau motivations.`)

  // Vérification
  const sample = await prisma.$queryRawUnsafe<Array<{
    id: string; firstName: string; motivation: string | null; motivations: string[]
  }>>(`
    SELECT id, "firstName", "motivation", "motivations"
      FROM "members"
     LIMIT 5
  `)
  console.log('Échantillon (5 premiers) :')
  for (const m of sample) {
    console.log(`  ${m.firstName.padEnd(20)} motivation=${m.motivation ?? '∅'}  motivations=${JSON.stringify(m.motivations)}`)
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
