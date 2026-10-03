// Migration ponctuelle PROD : ajoute les colonnes `memberType` et
// `associationRoles` sur la table members, avec défaut ADHERENT + [].
//
// Usage : npx tsx scripts/migrate-member-types-prod.ts
// Idempotent (ADD COLUMN IF NOT EXISTS).

import { PrismaClient } from '@prisma/client'

const PROD_URL = 'postgresql://neondb_owner:npg_F4WBLe6rxZTm@ep-sweet-unit-amybnzup-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const prod = new PrismaClient({ datasourceUrl: PROD_URL })

async function main() {
  console.log('🔄 Migration MemberType + AssociationRole sur PROD…\n')

  // 1) Créer les types enum s'ils n'existent pas
  console.log('1) Création des enums MemberType et AssociationRole…')
  await prod.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "MemberType" AS ENUM ('ADHERENT','MEMBRE_ASSOCIATION');
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  await prod.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "AssociationRole" AS ENUM (
        'PRESIDENT','VICE_PRESIDENT','SECRETAIRE','TRESORIER','MEMBRE_BUREAU',
        'COMITE_TECHNIQUE','COMITE_COMMUNICATION','COMITE_EVENEMENTS','COMITE_FINANCIER'
      );
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)
  console.log('   ✅ Enums présents.')

  // 2) Ajouter les colonnes
  console.log('\n2) Ajout des colonnes memberType et associationRoles…')
  await prod.$executeRawUnsafe(`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "memberType" "MemberType" NOT NULL DEFAULT 'ADHERENT'
  `)
  await prod.$executeRawUnsafe(`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "associationRoles" "AssociationRole"[]
    NOT NULL DEFAULT ARRAY[]::"AssociationRole"[]
  `)
  console.log('   ✅ Colonnes présentes.')

  // 3) Récapitulatif
  console.log('\n3) Récapitulatif :')
  const stats = await prod.$queryRawUnsafe<Array<{
    total: number; adherents: number; membres: number; with_roles: number
  }>>(`
    SELECT
      COUNT(*)::int                                                     AS total,
      COUNT(*) FILTER (WHERE "memberType" = 'ADHERENT')::int            AS adherents,
      COUNT(*) FILTER (WHERE "memberType" = 'MEMBRE_ASSOCIATION')::int  AS membres,
      COUNT(*) FILTER (WHERE cardinality("associationRoles") > 0)::int  AS with_roles
    FROM "members"
  `)
  const s = stats[0]
  console.log(`   Total membres                : ${s.total}`)
  console.log(`   ADHERENT (défaut)            : ${s.adherents}`)
  console.log(`   MEMBRE_ASSOCIATION           : ${s.membres}`)
  console.log(`   Avec rôles (bureau/comité)   : ${s.with_roles}`)
  console.log('\n✅ Migration terminée. Tu peux déployer le code.')
}

main()
  .catch(e => { console.error('❌ Erreur :', e); process.exit(1) })
  .finally(() => prod.$disconnect())
