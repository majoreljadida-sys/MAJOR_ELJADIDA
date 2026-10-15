import { requireEnv } from './_env'
import { Prisma, PrismaClient } from '@prisma/client'

const PROD_URL = requireEnv('PROD_DATABASE_URL')
const LOCAL_URL = requireEnv('DATABASE_URL')

// Garde-fou : ce script EFFACE la base cible. On refuse tout ce qui n'est pas local.
if (!/@(localhost|127\.0\.0\.1)(:\d+)?\//.test(LOCAL_URL)) {
  console.error('❌ DATABASE_URL ne pointe pas vers une base locale — synchronisation annulée.')
  process.exit(1)
}

const prod  = new PrismaClient({ datasourceUrl: PROD_URL })
const local = new PrismaClient({ datasourceUrl: LOCAL_URL })

async function main() {
  console.log('🔍 Lecture des données prod...')

  const [
    users, coaches, members, groups, sessions, attendances,
    events, registrations, payments, programs, programSessions,
    announcements, notifications, blogCategories, blogPosts, chatbotLogs,
    stravaActivities, expenses, pageViews, clubSettings, whatsappNotifications,
  ] = await Promise.all([
    prod.user.findMany(),
    prod.coach.findMany(),
    prod.member.findMany(),
    prod.trainingGroup.findMany(),
    prod.trainingSession.findMany(),
    prod.attendance.findMany(),
    prod.event.findMany(),
    prod.eventRegistration.findMany(),
    prod.payment.findMany(),
    prod.trainingProgram.findMany(),
    prod.trainingProgramSession.findMany(),
    prod.announcement.findMany(),
    prod.notification.findMany(),
    prod.blogCategory.findMany(),
    prod.blogPost.findMany(),
    prod.chatbotLog.findMany(),
    prod.stravaActivity.findMany(),
    prod.expense.findMany(),
    prod.pageView.findMany(),
    prod.clubSettings.findMany(),
    prod.whatsappNotification.findMany(),
  ])

  // present_count via raw SQL (hors schéma Prisma)
  const presentCounts = await prod.$queryRaw<{ id: string; present_count: number | null }[]>`
    SELECT id, present_count FROM training_sessions
  `

  console.log(`  Users: ${users.length}, Members: ${members.length}, Coaches: ${coaches.length}`)
  console.log(`  Groups: ${groups.length}, Sessions: ${sessions.length}, Attendances: ${attendances.length}`)
  console.log(`  Events: ${events.length}, Registrations: ${registrations.length}, Payments: ${payments.length}`)
  console.log(`  Programs: ${programs.length}, ProgramSessions: ${programSessions.length}`)
  console.log(`  BlogCategories: ${blogCategories.length}, BlogPosts: ${blogPosts.length}`)
  console.log(`  StravaActivities: ${stravaActivities.length}`)
  console.log(`  Expenses: ${expenses.length}, PageViews: ${pageViews.length}, ClubSettings: ${clubSettings.length}, WhatsappNotifications: ${whatsappNotifications.length}`)

  console.log('\n🗑️  Suppression des données locales...')

  // Ordre inverse des dépendances (enfants d'abord)
  await local.expense.deleteMany({})
  await local.whatsappNotification.deleteMany({})
  await local.pageView.deleteMany({})
  await local.clubSettings.deleteMany({})
  await local.stravaActivity.deleteMany({})
  await local.chatbotLog.deleteMany({})
  await local.blogPost.deleteMany({})
  await local.blogCategory.deleteMany({})
  await local.notification.deleteMany({})
  await local.announcement.deleteMany({})
  await local.attendance.deleteMany({})
  await local.eventRegistration.deleteMany({})
  await local.payment.deleteMany({})
  await local.trainingSession.deleteMany({})
  await local.trainingProgramSession.deleteMany({})
  await local.trainingProgram.deleteMany({})
  await local.event.deleteMany({})
  await local.member.deleteMany({})
  await local.trainingGroup.deleteMany({})
  await local.coach.deleteMany({})
  await local.user.deleteMany({})

  console.log('✓ Données locales effacées')

  console.log('\n📥 Insertion en local...')

  // 1. User (parent)
  if (users.length) await local.user.createMany({ data: users })
  console.log(`  ✓ ${users.length} users`)

  // 2. Coach (depend on User)
  if (coaches.length) await local.coach.createMany({ data: coaches })
  console.log(`  ✓ ${coaches.length} coaches`)

  // 3. TrainingGroup (depend on Coach)
  if (groups.length) await local.trainingGroup.createMany({ data: groups })
  console.log(`  ✓ ${groups.length} training groups`)

  // 4. Member (depend on User + Group)
  if (members.length) await local.member.createMany({ data: members })
  console.log(`  ✓ ${members.length} members`)

  // 5. TrainingProgram
  if (programs.length) await local.trainingProgram.createMany({ data: programs })
  console.log(`  ✓ ${programs.length} training programs`)

  // 6. TrainingProgramSession (depend on TrainingProgram)
  // Note : Prisma exige Prisma.JsonNull (pas null JS) pour les colonnes Json nullable.
  if (programSessions.length) {
    const normalized = programSessions.map(s => ({
      ...s,
      levels: s.levels === null ? Prisma.JsonNull : (s.levels as Prisma.InputJsonValue),
    }))
    await local.trainingProgramSession.createMany({ data: normalized })
  }
  console.log(`  ✓ ${programSessions.length} program sessions`)

  // 7. TrainingSession (depend on Group, Coach)
  if (sessions.length) await local.trainingSession.createMany({ data: sessions })
  console.log(`  ✓ ${sessions.length} training sessions`)

  // 7b. Mettre à jour present_count via SQL brut
  for (const pc of presentCounts) {
    if (pc.present_count !== null) {
      await local.$executeRawUnsafe(
        `UPDATE training_sessions SET present_count = $1 WHERE id = $2`,
        pc.present_count, pc.id
      )
    }
  }
  console.log(`  ✓ present_count mis à jour`)

  // 8. Attendance (depend on Member + TrainingSession)
  if (attendances.length) await local.attendance.createMany({ data: attendances })
  console.log(`  ✓ ${attendances.length} attendances`)

  // 9. Event
  if (events.length) await local.event.createMany({ data: events })
  console.log(`  ✓ ${events.length} events`)

  // 10. EventRegistration (depend on Member + Event)
  if (registrations.length) await local.eventRegistration.createMany({ data: registrations })
  console.log(`  ✓ ${registrations.length} event registrations`)

  // 11. Payment (depend on Member)
  if (payments.length) await local.payment.createMany({ data: payments })
  console.log(`  ✓ ${payments.length} payments`)

  // 12. Announcement
  if (announcements.length) await local.announcement.createMany({ data: announcements })
  console.log(`  ✓ ${announcements.length} announcements`)

  // 13. Notification
  if (notifications.length) await local.notification.createMany({ data: notifications })
  console.log(`  ✓ ${notifications.length} notifications`)

  // 14. BlogCategory
  if (blogCategories.length) await local.blogCategory.createMany({ data: blogCategories })
  console.log(`  ✓ ${blogCategories.length} blog categories`)

  // 15. BlogPost (depend on BlogCategory)
  if (blogPosts.length) await local.blogPost.createMany({ data: blogPosts })
  console.log(`  ✓ ${blogPosts.length} blog posts`)

  // 16. ChatbotLog
  if (chatbotLogs.length) await local.chatbotLog.createMany({ data: chatbotLogs })
  console.log(`  ✓ ${chatbotLogs.length} chatbot logs`)

  // 17. StravaActivity (table autonome, pas de FK)
  if (stravaActivities.length) await local.stravaActivity.createMany({ data: stravaActivities })
  console.log(`  ✓ ${stravaActivities.length} strava activities`)

  // 18. Expense (dépend de User, Event, TrainingSession)
  if (expenses.length) await local.expense.createMany({ data: expenses })
  console.log(`  ✓ ${expenses.length} expenses`)

  // 19. PageView, ClubSettings, WhatsappNotification (tables autonomes)
  if (pageViews.length) await local.pageView.createMany({ data: pageViews })
  console.log(`  ✓ ${pageViews.length} page views`)
  if (clubSettings.length) await local.clubSettings.createMany({ data: clubSettings })
  console.log(`  ✓ ${clubSettings.length} club settings`)
  if (whatsappNotifications.length) await local.whatsappNotification.createMany({ data: whatsappNotifications })
  console.log(`  ✓ ${whatsappNotifications.length} whatsapp notifications`)

  console.log('\n✅ Synchronisation terminée — local est maintenant identique à la prod')
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await prod.$disconnect(); await local.$disconnect() })
