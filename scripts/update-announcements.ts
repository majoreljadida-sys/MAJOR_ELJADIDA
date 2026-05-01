import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Supprimer les anciennes annonces
  await prisma.announcement.deleteMany({})

  // Créer les nouvelles annonces
  await prisma.announcement.createMany({
    data: [
      {
        title:   'Inscriptions ouvertes — Course 10 km We Casa 2026',
        content: 'Les inscriptions pour la Course 10 km We Casablanca sont officiellement ouvertes ! Rendez-vous le 17 mai 2026 à Casablanca. Profitez du tarif préférentiel réservé aux membres du Club MAJOR.',
      },
      {
        title:   'Grande sortie du dimanche — 03 mai 2026',
        content: 'Nouvelle séance : la grande sortie du dimanche le 03/05/2026. Retrouvez-nous pour une sortie longue conviviale. Tous les niveaux sont les bienvenus !',
      },
      {
        title:   'Rappel cotisations — 20 DH/mois',
        content: 'Rappel : la cotisation du club est fixée à 20 DH par mois. Merci de régulariser votre situation auprès du bureau ou via votre espace personnel.',
      },
    ],
  })

  console.log('✅ Annonces mises à jour avec succès')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
