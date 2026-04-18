import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Supprimer les inscriptions liées aux événements existants
  await prisma.eventRegistration.deleteMany({})
  // Supprimer tous les événements existants
  await prisma.event.deleteMany({})

  console.log('✓ Anciens événements supprimés')

  await prisma.event.createMany({
    data: [
      {
        title:           '10KM International WeCasablanca',
        slug:            '10km-wecasablanca-2026',
        type:            'COURSE_OFFICIELLE',
        date:            new Date('2026-05-17T08:30:00'),
        location:        'Twin Center, Casablanca',
        city:            'Casablanca',
        distance:        '10 km',
        price:           150,
        status:          'UPCOMING',
        description:     `Rejoignez le groupe MAJOR pour le 10KM International WeCasablanca, départ à 8h30 au Twin Center de Casablanca.

💰 Frais de participation avec le groupe MAJOR : 150 DH

⚠️ Important — Comment fonctionne la cotisation :
Cette avance de 150 DH est une participation initiale qui nous permet de nous engager collectivement en tant que groupe et de planifier la logistique (transport, ravitaillement, organisation). Une fois le nombre final de participants déterminé, la cotisation définitive sera recalculée de manière équitable. Si le montant total s'avère inférieur, la différence vous sera reversée ou déduite. Le Club MAJOR est une association à but non lucratif : nous ne faisons aucun bénéfice, les frais sont partagés justement entre tous les participants.

📝 Inscription officielle : via le site WeCasablanca`,
      },
      {
        title:           '15km de Bouskoura — 12ème édition',
        slug:            '15km-bouskoura-2026',
        type:            'COURSE_OFFICIELLE',
        date:            new Date('2026-06-07T08:00:00'),
        location:        'Forêt de Bouskoura, Casablanca',
        city:            'Bouskoura',
        distance:        '10 km | 15 km',
        price:           150,
        status:          'UPCOMING',
        description:     `Rejoignez le groupe MAJOR pour la 12ème édition des 15km de Bouskoura, organisée sous l'égide de la Fédération Royale Marocaine d'Athlétisme par l'association Planet Sport Runners. Deux courses au programme : 10km et 15km en forêt.

💰 Frais de participation avec le groupe MAJOR : 150 DH

⚠️ Important — Comment fonctionne la cotisation :
Cette avance de 150 DH est une participation initiale qui nous permet de nous engager collectivement en tant que groupe et de planifier la logistique (transport, ravitaillement, organisation). Une fois le nombre final de participants déterminé, la cotisation définitive sera recalculée de manière équitable. Si le montant total s'avère inférieur, la différence vous sera reversée ou déduite. Le Club MAJOR est une association à but non lucratif : nous ne faisons aucun bénéfice, les frais sont partagés justement entre tous les participants.

📝 Inscription officielle : https://15kmbouskoura.ma/inscription/`,
      },
      {
        title:           'Semi-Marathon International de Casablanca — 10ème édition',
        slug:            'semi-marathon-casablanca-2026',
        type:            'COURSE_OFFICIELLE',
        date:            new Date('2026-06-28T07:45:00'),
        location:        'Complexe Sportif Mohamed V, Casablanca',
        city:            'Casablanca',
        distance:        '21 km | 10 km',
        price:           150,
        status:          'UPCOMING',
        description:     `Rejoignez le groupe MAJOR pour la 10ème édition du Semi-Marathon International de Casablanca, 100% réservé aux amateurs. Deux distances : Semi-Marathon (21km) départ à 7h45 et 10km départ à 8h15, au Complexe Sportif Mohamed V.

💰 Frais de participation avec le groupe MAJOR : 150 DH

⚠️ Important — Comment fonctionne la cotisation :
Cette avance de 150 DH est une participation initiale qui nous permet de nous engager collectivement en tant que groupe et de planifier la logistique (transport, ravitaillement, organisation). Une fois le nombre final de participants déterminé, la cotisation définitive sera recalculée de manière équitable. Si le montant total s'avère inférieur, la différence vous sera reversée ou déduite. Le Club MAJOR est une association à but non lucratif : nous ne faisons aucun bénéfice, les frais sont partagés justement entre tous les participants.

📝 Plus d'infos : www.semimarathon.ma`,
      },
    ],
  })

  console.log('✓ 3 nouveaux événements créés')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
