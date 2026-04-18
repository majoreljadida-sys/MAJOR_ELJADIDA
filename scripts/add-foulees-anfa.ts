import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.event.create({
    data: {
      title:       'Foulées de Casa Anfa — 6ème édition',
      slug:        'foulees-casa-anfa-2026',
      type:        'COURSE_OFFICIELLE',
      date:        new Date('2026-05-24T08:00:00'),
      location:    'ANFAPARK, Casablanca',
      city:        'Casablanca',
      distance:    '5 km | 10 km',
      price:       250,
      status:      'UPCOMING',
      description: `Rejoignez le groupe MAJOR pour la 6ème édition des Foulées de Casa Anfa à ANFAPARK, Casablanca. Plus de 4 500 participants attendus, deux distances au programme : 5km (convivial, familles, entreprises) et 10km (performance et endurance).

💰 Frais de participation avec le groupe MAJOR : 250 DH

⚠️ Important — Comment fonctionne la cotisation :
Cette avance de 250 DH est une participation initiale qui nous permet de nous engager collectivement en tant que groupe et de planifier la logistique (transport, ravitaillement, organisation). Une fois le nombre final de participants déterminé, la cotisation définitive sera recalculée de manière équitable. Si le montant total s'avère inférieur, la différence vous sera reversée ou déduite. Le Club MAJOR est une association à but non lucratif : nous ne faisons aucun bénéfice, les frais sont partagés justement entre tous les participants.

📝 Inscription officielle : https://fouleesdecasaanfa.ma/`,
    },
  })
  console.log('✓ Foulées de Casa Anfa 2026 ajoutée')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
