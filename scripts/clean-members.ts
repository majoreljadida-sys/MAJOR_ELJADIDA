import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const keep = ['cmnxud5cz000wmt4gf843tsow', 'cmnxud5cz000vmt4ggnys5ayk', 'cmo1y0d7i0001g95hik8w6skk']

  const toDelete = await prisma.member.findMany({
    where: { id: { notIn: keep } },
    select: { id: true, userId: true },
  })

  const ids = toDelete.map(m => m.id)
  const userIds = toDelete.map(m => m.userId).filter(Boolean) as string[]

  // Supprimer les données liées
  await prisma.eventRegistration.deleteMany({ where: { memberId: { in: ids } } })
  await prisma.payment.deleteMany({ where: { memberId: { in: ids } } })
  await prisma.attendance.deleteMany({ where: { memberId: { in: ids } } })

  // Supprimer les membres
  await prisma.member.deleteMany({ where: { id: { in: ids } } })

  // Supprimer les users liés (sauf ADMIN/COACH)
  if (userIds.length > 0) {
    await prisma.user.deleteMany({
      where: { id: { in: userIds }, role: 'MEMBER' },
    })
  }

  console.log(`✓ ${ids.length} membres supprimés`)
  console.log('✓ 3 membres conservés : Mohammed Alami, Karim Tazi, Yassine CHAHBI')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
