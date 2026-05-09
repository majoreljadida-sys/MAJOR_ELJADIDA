// Migration ponctuelle PROD : passage du champ scalaire `motivation` au tableau `motivations`.
//
// À exécuter UNE FOIS sur la DB Neon PROD AVANT de déployer le code.
// Idempotent : peut être relancé sans danger.
//
// Usage :
//   npx tsx scripts/migrate-motivations-prod.ts
//
// Étapes :
//   1. Ajoute la colonne `motivations MotivationGoal[]` (default '{}', NOT NULL)
//      si elle n'existe pas déjà.
//   2. Copie les valeurs de l'ancien champ scalaire `motivation` dans le nouveau
//      tableau pour les membres dont le tableau est vide.
//   3. Affiche un récapitulatif.
//
// L'ancienne colonne `motivation` est CONSERVÉE — on la droppera dans une
// migration ultérieure une fois la prod stabilisée.

import { PrismaClient } from '@prisma/client'

const PROD_URL = 'postgresql://neondb_owner:npg_F4WBLe6rxZTm@ep-sweet-unit-amybnzup-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const prod = new PrismaClient({ datasourceUrl: PROD_URL })

async function main() {
  console.log('🔄 Migration motivations sur PROD…\n')

  // Étape 1 : ajouter la colonne si elle n'existe pas
  console.log('1) Ajout de la colonne motivations[] si manquante…')
  await prod.$executeRawUnsafe(`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "motivations" "MotivationGoal"[]
    NOT NULL DEFAULT ARRAY[]::"MotivationGoal"[]
  `)
  console.log('   ✅ Colonne présente.')

  // Étape 2 : migrer les valeurs scalaires existantes
  console.log('\n2) Migration des valeurs scalaires → tableau…')
  const updated = await prod.$executeRawUnsafe(`
    UPDATE "members"
       SET "motivations" = ARRAY["motivation"]::"MotivationGoal"[]
     WHERE "motivation" IS NOT NULL
       AND ("motivations" IS NULL OR cardinality("motivations") = 0)
  `)
  console.log(`   ✅ ${updated} membre(s) migré(s).`)

  // Étape 3 : récapitulatif
  console.log('\n3) Récapitulatif :')
  const stats = await prod.$queryRawUnsafe<Array<{
    total: number; with_old: number; with_new: number; mismatch: number
  }>>(`
    SELECT
      COUNT(*)::int                                                        AS total,
      COUNT(*) FILTER (WHERE "motivation" IS NOT NULL)::int                AS with_old,
      COUNT(*) FILTER (WHERE cardinality("motivations") > 0)::int          AS with_new,
      COUNT(*) FILTER (WHERE "motivation" IS NOT NULL
                         AND cardinality("motivations") = 0)::int          AS mismatch
    FROM "members"
  `)
  const s = stats[0]
  console.log(`   Total membres                     : ${s.total}`)
  console.log(`   Avec ancienne motivation (scalar) : ${s.with_old}`)
  console.log(`   Avec nouvelle motivations[] non-vide : ${s.with_new}`)
  console.log(`   Désaccord (à investiguer)         : ${s.mismatch}`)

  if (s.mismatch > 0) {
    console.warn('\n⚠️  Il reste des membres avec motivation scalaire mais motivations[] vide.')
    console.warn('   Relance ce script ou inspecte manuellement.')
  } else {
    console.log('\n✅ Migration terminée. Tu peux déployer le code.')
  }
}

main()
  .catch(e => { console.error('❌ Erreur :', e); process.exit(1) })
  .finally(() => prod.$disconnect())
