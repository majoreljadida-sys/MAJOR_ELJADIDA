import { PrismaClient, TrainingType } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.trainingProgram.deleteMany({ where: { month: 4, year: 2026 } })

  await prisma.trainingProgram.create({
    data: {
      month: 4,
      year:  2026,
      title: "Programme d'entraînement Avril 2026",
      description: "Programme mensuel Club MAJOR — Mazagan Athlétisme Jogging And Organisation Running.\nObjectif : Progression régulière avec alternance endurance fondamentale, fractionné et renforcement musculaire.",
      sessions: {
        create: [
          {
            dateFrom: new Date('2026-03-30'), dateTo: new Date('2026-03-31'),
            title: 'Endurance fondamentale',
            description: 'Endurance fondamentale — 45 à 60 min\nCourir à un rythme confortable, environ 65-75% de la FCM.',
            type: TrainingType.ENDURANCE_FONDAMENTALE,
          },
          {
            dateFrom: new Date('2026-04-01'), dateTo: new Date('2026-04-02'),
            title: "Fractionné long : 5 x 4'",
            description: "20' footing échauffement\nFractionné long : 5 x 4' à 90-95% VMA\nRécup : 2' marche/trot",
            type: TrainingType.FRACTIONNE,
          },
          {
            dateFrom: new Date('2026-04-03'), dateTo: new Date('2026-04-04'),
            title: 'EF + Renforcement musculaire',
            description: 'EF 60min + Renforcement musculaire\n• PPS : montée de genoux, talons-fesses\n• PPG : gainage, squats, fentes',
            type: TrainingType.RENFORCEMENT,
          },
          {
            dateFrom: new Date('2026-04-05'), dateTo: null,
            title: 'Sortie longue 10-15 km',
            description: 'Sortie longue progressive\nDistances : 10 km et 15 km\nDépart en EF, finir sur une allure semi-marathon.',
            type: TrainingType.SORTIE_LONGUE,
          },
          {
            dateFrom: new Date('2026-04-06'), dateTo: new Date('2026-04-07'),
            title: 'Endurance fondamentale',
            description: 'Endurance fondamentale — 45 à 60 min\nCourir à un rythme confortable, environ 65-75% de la FCM.',
            type: TrainingType.ENDURANCE_FONDAMENTALE,
          },
          {
            dateFrom: new Date('2026-04-08'), dateTo: new Date('2026-04-09'),
            title: "Fractionné court : 10 x 1'",
            description: "20' footing échauffement\nFractionné court : 10 x 1' à VMA\nRécup : 1' trot",
            type: TrainingType.FRACTIONNE,
          },
          {
            dateFrom: new Date('2026-04-10'), dateTo: new Date('2026-04-11'),
            title: 'EF + Renforcement musculaire',
            description: 'EF 45 à 50min + Renforcement musculaire\n• PPS : éducatifs de course\n• PPG : gainage, squats, fentes',
            type: TrainingType.RENFORCEMENT,
          },
          {
            dateFrom: new Date('2026-04-13'), dateTo: new Date('2026-04-14'),
            title: 'Endurance fondamentale',
            description: 'Endurance fondamentale — 45 à 60 min\nCourir à un rythme confortable, environ 65-75% de la FCM.',
            type: TrainingType.ENDURANCE_FONDAMENTALE,
          },
          {
            dateFrom: new Date('2026-04-15'), dateTo: new Date('2026-04-16'),
            title: "Fractionné long : 5 x 4'",
            description: "20' footing échauffement\nFractionné long : 5x 4' à 90-95% VMA\nRécup : 1' marche/trot",
            type: TrainingType.FRACTIONNE,
          },
          {
            dateFrom: new Date('2026-04-17'), dateTo: new Date('2026-04-18'),
            title: 'EF + Renforcement musculaire',
            description: 'EF 45 à 50min + Renforcement musculaire\n• PPS : éducatifs de course\n• PPG : gainage, squats, fentes',
            type: TrainingType.RENFORCEMENT,
          },
          {
            dateFrom: new Date('2026-04-20'), dateTo: new Date('2026-04-21'),
            title: 'Endurance fondamentale',
            description: 'Endurance fondamentale — 45 à 60 min\nCourir à un rythme confortable, environ 65-75% de la FCM.',
            type: TrainingType.ENDURANCE_FONDAMENTALE,
          },
          {
            dateFrom: new Date('2026-04-22'), dateTo: new Date('2026-04-23'),
            title: "Fractionné court : 10 x 1'",
            description: "20' footing échauffement\nFractionné court : 10 x 1' à VMA\nRécup : 1' trot",
            type: TrainingType.FRACTIONNE,
          },
          {
            dateFrom: new Date('2026-04-24'), dateTo: new Date('2026-04-25'),
            title: 'EF + Renforcement musculaire',
            description: 'EF 50min + Renforcement musculaire\n• PPS : éducatifs de course\n• PPG : gainage, squats, fentes',
            type: TrainingType.RENFORCEMENT,
          },
          {
            dateFrom: new Date('2026-04-26'), dateTo: null,
            title: 'Sortie longue 10-15-18 km',
            description: 'Sortie longue progressive\nDistances : 10 km · 15 km · 18 km\nDépart en EF, finir sur une allure semi-marathon.',
            type: TrainingType.SORTIE_LONGUE,
          },
          {
            dateFrom: new Date('2026-04-27'), dateTo: new Date('2026-04-28'),
            title: 'Endurance fondamentale',
            description: 'Endurance fondamentale — 45 à 60 min\nCourir à un rythme confortable, environ 65-75% de la FCM.',
            type: TrainingType.ENDURANCE_FONDAMENTALE,
          },
          {
            dateFrom: new Date('2026-04-29'), dateTo: new Date('2026-04-30'),
            title: "Fractionné court : 10 x 1'",
            description: "20' footing échauffement\nFractionné court : 10 x 1' à VMA\nRécup : 1' trot",
            type: TrainingType.FRACTIONNE,
          },
          {
            dateFrom: new Date('2026-05-01'), dateTo: new Date('2026-05-02'),
            title: 'EF + Renforcement musculaire',
            description: 'EF 45 à 50min + Renforcement musculaire\n• PPS : éducatifs de course\n• PPG : gainage, squats, fentes',
            type: TrainingType.RENFORCEMENT,
          },
          {
            dateFrom: new Date('2026-05-03'), dateTo: null,
            title: 'Sortie longue 10-15-21 km',
            description: 'Sortie longue progressive\nDistances : 10 km · 15 km · 21 km (semi-marathon)\nDépart en EF, finir sur une allure semi-marathon.',
            type: TrainingType.SORTIE_LONGUE,
          },
        ],
      },
    },
  })
  console.log('✅  Programme Avril 2026 créé (18 séances)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
