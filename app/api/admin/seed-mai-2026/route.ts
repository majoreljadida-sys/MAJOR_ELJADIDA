import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('key') !== 'major2026seed') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  await prisma.trainingProgram.deleteMany({ where: { month: 5, year: 2026 } })

  const program = await prisma.trainingProgram.create({
    data: {
      month: 5,
      year: 2026,
      title: "Programme d'entraînement et participation – Mai 2026",
      description:
        "Préparation : WeCasablanca 10 KM (17 mai) • Foulées de Casa Anfa 10 KM (24 mai)\n\n" +
        "• Semaine 1 (4-10 mai) : entretien et pré-affûtage.\n" +
        "• Semaine 2 (11-17 mai) : affûtage complet avant WeCasablanca.\n" +
        "• Semaine 3 (18-24 mai) : récupération active + activations légères.\n" +
        "• Semaine 4 (25-31 mai) : repos post-compétition puis reprise progressive.\n" +
        "• Hydratation, sommeil et nutrition : à soigner les 5 jours avant chaque course.",
      sessions: {
        create: [
          { dateFrom: new Date('2026-05-03'), title: "MAJOR c'est les belles valeurs, MAJOR c'est la famille", description: "Sortie longue exceptionnelle ouverte à tous les niveaux.\n• 8 km — tous niveaux\n• 10 km — intermédiaires\n• 15 km — confirmés et vétérans\nMoment de partage et de convivialité dans l'esprit MAJOR.", type: 'SORTIE_LONGUE' },
          { dateFrom: new Date('2026-05-04'), dateTo: new Date('2026-05-05'), title: 'Endurance fondamentale', description: 'EF 40 à 50 min – volume légèrement réduit (pré-affûtage).', type: 'ENDURANCE_FONDAMENTALE' },
          { dateFrom: new Date('2026-05-06'), dateTo: new Date('2026-05-07'), title: 'Fractionné court', description: "20' footing échauffement\nFractionné court : 8 × 45'' à VMA\nRécup : 1'15'' trot", type: 'FRACTIONNE' },
          { dateFrom: new Date('2026-05-08'), dateTo: new Date('2026-05-09'), title: 'EF + Renforcement musculaire', description: 'EF 40 min + Renforcement musculaire (PPS) – PPG allégé.', type: 'RENFORCEMENT' },
          { dateFrom: new Date('2026-05-10'), title: 'Sortie modérée du dimanche', description: 'Sortie modérée 8 à 10 km en EF + 4 à 6 lignes droites (100 m).\nVétérans : 15 km.', type: 'SORTIE_LONGUE' },
          { dateFrom: new Date('2026-05-11'), dateTo: new Date('2026-05-12'), title: 'EF souple – affûtage', description: 'EF souple 30 à 40 min – allure très facile (affûtage pré-course).', type: 'ENDURANCE_FONDAMENTALE' },
          { dateFrom: new Date('2026-05-13'), dateTo: new Date('2026-05-14'), title: 'Activation neuromusculaire', description: "15' footing + 5 × 30'' à allure 10 km\nRécup : 1'30'' trot\nActivation neuromusculaire.", type: 'FRACTIONNE' },
          { dateFrom: new Date('2026-05-15'), dateTo: new Date('2026-05-16'), title: 'Repos / EF très lente', description: 'Repos OU 20-25 min EF très lente + étirements & mobilité.', type: 'RECUPERATION' },
          { dateFrom: new Date('2026-05-17'), title: '■ COURSE — WeCasablanca 10 KM', description: 'Course WeCasablanca 10 KM – Casablanca.\nObjectif : performance.', type: 'PREPARATION_COMPETITION' },
          { dateFrom: new Date('2026-05-18'), dateTo: new Date('2026-05-19'), title: 'Repos actif – récupération post-course', description: 'Repos actif OU 30 min EF très souple (récupération post-course).', type: 'RECUPERATION' },
          { dateFrom: new Date('2026-05-20'), dateTo: new Date('2026-05-21'), title: 'Réveil musculaire – activations légères', description: "20' footing + 6 × 30'' à allure 10 km\nRécup : 1' trot – Réveil musculaire léger.", type: 'FRACTIONNE' },
          { dateFrom: new Date('2026-05-22'), dateTo: new Date('2026-05-23'), title: 'EF très souple + repos la veille', description: 'EF 25-30 min très souple + étirements – Repos la veille de la course.', type: 'RECUPERATION' },
          { dateFrom: new Date('2026-05-24'), title: '■ COURSE — Foulées Casa Anfa 10 KM', description: 'Course Foulées de Casa Anfa 10 KM – Casablanca.\nObjectif : plaisir.', type: 'PREPARATION_COMPETITION' },
          { dateFrom: new Date('2026-05-25'), dateTo: new Date('2026-05-26'), title: 'Repos complet post-compétition', description: 'Repos complet OU marche active 30 min + étirements profonds.', type: 'RECUPERATION' },
          { dateFrom: new Date('2026-05-27'), dateTo: new Date('2026-05-28'), title: 'EF souple – reprise progressive', description: 'EF 30 à 40 min – allure souple (reprise progressive).', type: 'ENDURANCE_FONDAMENTALE' },
          { dateFrom: new Date('2026-05-29'), dateTo: new Date('2026-05-30'), title: 'EF + PPS léger', description: 'EF 45 min + PPS léger (éducatifs) – pas de PPG intense.', type: 'RENFORCEMENT' },
          { dateFrom: new Date('2026-05-31'), title: 'Sortie longue progressive – reprise du cycle', description: 'Sortie longue progressive 10 à 12 km en EF – Reprise du cycle.\nVétérans : 15 km.', type: 'SORTIE_LONGUE' },
        ],
      },
    },
    include: { sessions: true },
  })

  return NextResponse.json({ ok: true, sessions: program.sessions.length })
}
