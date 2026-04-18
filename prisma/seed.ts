// ============================================================
// Seed — Club MAJOR — Données de démonstration
// ============================================================
import { PrismaClient, Role, MemberStatus, MemberCategory,
  TshirtSize, TrainingType, EventType, PaymentType,
  PaymentStatus, Priority } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱  Initialisation du seed Club MAJOR...')

  // ── 1. Nettoyage ─────────────────────────────────────────
  await prisma.chatbotLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.eventRegistration.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.trainingSession.deleteMany()
  await prisma.event.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.blogCategory.deleteMany()
  await prisma.member.deleteMany()
  await prisma.coach.deleteMany()
  await prisma.trainingGroup.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅  Base nettoyée')

  // ── 2. Utilisateurs / Admin ───────────────────────────────
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@clubmajor.ma',
      password: await bcrypt.hash('Admin@Major2025', 12),
      role: Role.ADMIN,
    },
  })

  const coachUser1 = await prisma.user.create({
    data: {
      email: 'youssef.coach@clubmajor.ma',
      password: await bcrypt.hash('Coach@2025', 12),
      role: Role.COACH,
    },
  })
  const coachUser2 = await prisma.user.create({
    data: {
      email: 'fatima.coach@clubmajor.ma',
      password: await bcrypt.hash('Coach@2025', 12),
      role: Role.COACH,
    },
  })

  const memberEmails = [
    'mohammed.alami@email.ma',
    'sara.benali@email.ma',
    'karim.tazi@email.ma',
    'nadia.chraibi@email.ma',
    'amine.berrada@email.ma',
    'imane.ghazi@email.ma',
    'omar.filali@email.ma',
    'hind.ouali@email.ma',
    'yassine.belhaj@email.ma',
    'leila.mansouri@email.ma',
  ]
  const memberUsers = await Promise.all(
    memberEmails.map(email =>
      prisma.user.create({
        data: {
          email,
          password: bcrypt.hashSync('Member@2025', 12),
          role: Role.MEMBER,
        },
      })
    )
  )
  console.log('✅  Utilisateurs créés')

  // ── 3. Coachs ─────────────────────────────────────────────
  const coach1 = await prisma.coach.create({
    data: {
      userId:    coachUser1.id,
      firstName: 'Youssef',
      lastName:  'Idrissi',
      specialty: 'Endurance & Compétition',
      bio:       'Ancien marathonien, champion régional 2018-2022. Certifié FRMA niveau 2. Spécialiste préparation marathon et semi-marathon.',
      phone:     '+212 6 61 23 45 67',
    },
  })
  const coach2 = await prisma.coach.create({
    data: {
      userId:    coachUser2.id,
      firstName: 'Fatima',
      lastName:  'Benkirane',
      specialty: 'Jogging & Initiation',
      bio:       'Coach certifiée spécialisée running loisir et initiation. Passionnée par l\'inclusion sportive et le bien-être par la course.',
      phone:     '+212 6 62 34 56 78',
    },
  })
  console.log('✅  Coachs créés')

  // ── 4. Groupes ────────────────────────────────────────────
  const group1 = await prisma.trainingGroup.create({
    data: {
      name:        'Élite Compétition',
      description: 'Groupe pour les athlètes engagés en compétition officielle. Entraînements intensifs.',
      level:       'Avancé',
      coachId:     coach1.id,
    },
  })
  const group2 = await prisma.trainingGroup.create({
    data: {
      name:        'Jogging Loisir',
      description: 'Pour tous les coureurs souhaitant pratiquer à leur rythme dans une ambiance conviviale.',
      level:       'Débutant / Intermédiaire',
      coachId:     coach2.id,
    },
  })
  const group3 = await prisma.trainingGroup.create({
    data: {
      name:        'Progression Intermédiaire',
      description: 'Groupe intermédiaire pour coureurs souhaitant progresser et préparer leurs premières compétitions.',
      level:       'Intermédiaire',
      coachId:     coach1.id,
    },
  })
  console.log('✅  Groupes créés')

  // ── 5. Membres ────────────────────────────────────────────
  const membersData = [
    { firstName: 'Mohammed', lastName: 'Alami',    dob: '1990-03-15', phone: '+212 6 61 11 22 33', tshirt: TshirtSize.L,  status: MemberStatus.ACTIVE,   category: MemberCategory.COMPETITION, groupId: group1.id, license: 'MAJ-2025-001' },
    { firstName: 'Sara',     lastName: 'Benali',   dob: '1995-07-22', phone: '+212 6 62 22 33 44', tshirt: TshirtSize.S,  status: MemberStatus.ACTIVE,   category: MemberCategory.LOISIR,      groupId: group2.id, license: 'MAJ-2025-002' },
    { firstName: 'Karim',    lastName: 'Tazi',     dob: '1988-11-08', phone: '+212 6 63 33 44 55', tshirt: TshirtSize.XL, status: MemberStatus.ACTIVE,   category: MemberCategory.COMPETITION, groupId: group1.id, license: 'MAJ-2025-003' },
    { firstName: 'Nadia',    lastName: 'Chraibi',  dob: '1993-05-30', phone: '+212 6 64 44 55 66', tshirt: TshirtSize.M,  status: MemberStatus.PENDING,  category: MemberCategory.LOISIR,      groupId: group2.id, license: 'MAJ-2025-004' },
    { firstName: 'Amine',    lastName: 'Berrada',  dob: '1987-09-14', phone: '+212 6 65 55 66 77', tshirt: TshirtSize.L,  status: MemberStatus.ACTIVE,   category: MemberCategory.COMPETITION, groupId: group3.id, license: 'MAJ-2025-005' },
    { firstName: 'Imane',    lastName: 'Ghazi',    dob: '1998-01-25', phone: '+212 6 66 66 77 88', tshirt: TshirtSize.XS, status: MemberStatus.ACTIVE,   category: MemberCategory.JUNIOR,      groupId: group2.id, license: 'MAJ-2025-006' },
    { firstName: 'Omar',     lastName: 'Filali',   dob: '1975-12-03', phone: '+212 6 67 77 88 99', tshirt: TshirtSize.M,  status: MemberStatus.EXPIRED,  category: MemberCategory.VETERAN,     groupId: group2.id, license: 'MAJ-2024-007' },
    { firstName: 'Hind',     lastName: 'Ouali',    dob: '1992-08-19', phone: '+212 6 68 88 99 00', tshirt: TshirtSize.M,  status: MemberStatus.ACTIVE,   category: MemberCategory.LOISIR,      groupId: group2.id, license: 'MAJ-2025-008' },
    { firstName: 'Yassine',  lastName: 'Belhaj',   dob: '1991-04-07', phone: '+212 6 69 99 00 11', tshirt: TshirtSize.L,  status: MemberStatus.ACTIVE,   category: MemberCategory.COMPETITION, groupId: group3.id, license: 'MAJ-2025-009' },
    { firstName: 'Leila',    lastName: 'Mansouri', dob: '1996-06-11', phone: '+212 6 70 00 11 22', tshirt: TshirtSize.S,  status: MemberStatus.SUSPENDED,category: MemberCategory.LOISIR,      groupId: null,      license: 'MAJ-2024-010' },
  ]

  const members = await Promise.all(
    membersData.map((m, i) =>
      prisma.member.create({
        data: {
          userId:       memberUsers[i].id,
          firstName:    m.firstName,
          lastName:     m.lastName,
          dateOfBirth:  new Date(m.dob),
          placeOfBirth: 'El Jadida, Maroc',
          phone:        m.phone,
          tshirtSize:   m.tshirt,
          status:       m.status,
          category:     m.category,
          licenseNumber: m.license,
          groupId:      m.groupId ?? undefined,
        },
      })
    )
  )
  console.log('✅  Membres créés')

  // ── 6. Séances d'entraînement ────────────────────────────
  const now = new Date()
  const sessions = [
    { title: 'Endurance Fondamentale — Corniche', type: TrainingType.ENDURANCE_FONDAMENTALE, daysOffset: -7,  duration: 90,  distance: 12, location: 'Corniche d\'El Jadida', coachId: coach1.id, groupId: group1.id },
    { title: 'Fractionné Stade',                  type: TrainingType.FRACTIONNE,             daysOffset: -3,  duration: 75,  distance: 8,  location: 'Stade Municipal El Jadida', coachId: coach1.id, groupId: group1.id },
    { title: 'Sortie Longue Dimanche',             type: TrainingType.SORTIE_LONGUE,          daysOffset: -1,  duration: 120, distance: 18, location: 'Départ Parc Hassan II', coachId: coach2.id, groupId: group2.id },
    { title: 'Jogging Convivial',                  type: TrainingType.ENDURANCE_FONDAMENTALE, daysOffset: 2,   duration: 60,  distance: 8,  location: 'Parc Hassan II', coachId: coach2.id, groupId: group2.id },
    { title: 'Préparation 10km Mazagan',           type: TrainingType.PREPARATION_COMPETITION, daysOffset: 5,  duration: 90,  distance: 10, location: 'Stade Municipal El Jadida', coachId: coach1.id, groupId: group3.id },
    { title: 'Récupération Active',                type: TrainingType.RECUPERATION,           daysOffset: 7,   duration: 45,  distance: 5,  location: 'Corniche d\'El Jadida', coachId: coach2.id, groupId: group2.id },
    { title: 'Renforcement Musculaire',            type: TrainingType.RENFORCEMENT,           daysOffset: 10,  duration: 60,  distance: 0,  location: 'Salle Club MAJOR', coachId: coach1.id, groupId: group1.id },
    { title: 'Fractionné Courte Distance',         type: TrainingType.FRACTIONNE,             daysOffset: 14,  duration: 80,  distance: 7,  location: 'Stade Municipal El Jadida', coachId: coach1.id, groupId: group3.id },
  ]

  await Promise.all(
    sessions.map(s => {
      const d = new Date(now)
      d.setDate(d.getDate() + s.daysOffset)
      return prisma.trainingSession.create({
        data: {
          title:    s.title,
          date:     d,
          location: s.location,
          type:     s.type,
          duration: s.duration,
          distance: s.distance,
          coachId:  s.coachId,
          groupId:  s.groupId,
          maxParticipants: 25,
          status: s.daysOffset < 0 ? 'COMPLETED' : 'SCHEDULED',
        },
      })
    })
  )
  console.log('✅  Séances créées')

  // ── 7. Événements ────────────────────────────────────────
  const events = [
    {
      title: 'Course des Remparts de Mazagan',
      slug: 'course-remparts-mazagan-2025',
      description: 'La course emblématique du Club MAJOR ! Parcours historique le long des remparts de la médina d\'El Jadida classée UNESCO. Distances : 5 km, 10 km et semi-marathon. Ouverte à tous les niveaux.',
      daysOffset: 25,
      location: 'Médina d\'El Jadida — UNESCO',
      city: 'El Jadida',
      type: EventType.COURSE_OFFICIELLE,
      maxParticipants: 500,
      price: 50,
      distance: '5 km / 10 km / 21 km',
    },
    {
      title: 'Stage Intensif Été Running',
      slug: 'stage-intensif-ete-2025',
      description: 'Stage d\'entraînement estival sur 3 jours. Au programme : séances matin et soir, ateliers nutrition, analyse de foulée et conseils personnalisés par nos coachs.',
      daysOffset: 45,
      location: 'Centre de Formation El Jadida',
      city: 'El Jadida',
      type: EventType.STAGE,
      maxParticipants: 40,
      price: 200,
      distance: 'Variable',
    },
    {
      title: 'Sortie Running — Forêt de Mazagan',
      slug: 'sortie-foret-mazagan-2025',
      description: 'Sortie trail découverte dans la forêt de Mazagan. Parcours de 15 km en terrain varié. Idéale pour se préparer aux courses nature. Niveau intermédiaire recommandé.',
      daysOffset: 12,
      location: 'Forêt de Mazagan',
      city: 'El Jadida',
      type: EventType.SORTIE_RUNNING,
      maxParticipants: 60,
      price: 0,
      distance: '15 km',
    },
    {
      title: 'Interclubs Région Doukkala-Abda',
      slug: 'interclubs-doukkala-2025',
      description: 'Compétition interclubs regroupant les meilleurs athlètes de la région. Disciplines : 100m, 400m, 1500m, 5000m, 10km route. Inscription via votre profil adhérent.',
      daysOffset: 60,
      location: 'Complexe Sportif Régional',
      city: 'Safi',
      type: EventType.COMPETITION,
      maxParticipants: 200,
      price: 30,
      distance: 'Multiples disciplines',
    },
    {
      title: 'Assemblée Générale & Repas du Club',
      slug: 'ag-repas-club-2025',
      description: 'Assemblée générale annuelle suivie d\'un repas convivial. Présentation du bilan de la saison, élection du bureau, et projets 2025-2026. Tous les membres sont invités.',
      daysOffset: -5,
      location: 'Restaurant La Corniche',
      city: 'El Jadida',
      type: EventType.EVENEMENT_CLUB,
      maxParticipants: 120,
      price: 80,
      distance: null,
    },
  ]

  const createdEvents = await Promise.all(
    events.map(e => {
      const d = new Date(now)
      d.setDate(d.getDate() + e.daysOffset)
      return prisma.event.create({
        data: {
          title:          e.title,
          slug:           e.slug,
          description:    e.description,
          date:           d,
          location:       e.location,
          city:           e.city,
          type:           e.type,
          maxParticipants: e.maxParticipants,
          price:          e.price,
          distance:       e.distance ?? undefined,
          status:         e.daysOffset < 0 ? 'COMPLETED' : 'UPCOMING',
        },
      })
    })
  )
  console.log('✅  Événements créés')

  // ── 8. Inscriptions événements ────────────────────────────
  await prisma.eventRegistration.createMany({
    data: [
      { memberId: members[0].id, eventId: createdEvents[0].id },
      { memberId: members[1].id, eventId: createdEvents[0].id },
      { memberId: members[2].id, eventId: createdEvents[0].id },
      { memberId: members[4].id, eventId: createdEvents[0].id },
      { memberId: members[8].id, eventId: createdEvents[0].id },
      { memberId: members[1].id, eventId: createdEvents[2].id },
      { memberId: members[3].id, eventId: createdEvents[2].id },
      { memberId: members[5].id, eventId: createdEvents[2].id },
      { memberId: members[7].id, eventId: createdEvents[2].id },
    ],
  })
  console.log('✅  Inscriptions créées')

  // ── 9. Paiements ─────────────────────────────────────────
  const paymentsData = members.flatMap((m, i) => {
    const saison = '2024-2025'
    const base: any[] = [
      {
        memberId: m.id,
        amount: 600,
        type: PaymentType.COTISATION_ANNUELLE,
        season: saison,
        status: i < 6 ? PaymentStatus.PAID : i === 6 ? PaymentStatus.LATE : PaymentStatus.PENDING,
        paidDate: i < 6 ? new Date('2024-09-15') : undefined,
        dueDate: new Date('2024-10-01'),
      },
    ]
    // Quelques paiements mensuels
    if (i < 3) {
      base.push({
        memberId: m.id,
        amount: 60,
        type: PaymentType.COTISATION_MENSUELLE,
        season: saison,
        status: PaymentStatus.PAID,
        paidDate: new Date('2025-04-01'),
        dueDate: new Date('2025-04-05'),
      })
    }
    return base
  })

  await prisma.payment.createMany({ data: paymentsData })
  console.log('✅  Paiements créés')

  // ── 10. Annonces ─────────────────────────────────────────
  const expiresIn30 = new Date(now)
  expiresIn30.setDate(expiresIn30.getDate() + 30)

  await prisma.announcement.createMany({
    data: [
      {
        title:    'Inscriptions ouvertes — Course des Remparts 2025',
        content:  'Les inscriptions pour la Course des Remparts de Mazagan sont officiellement ouvertes ! Profitez du tarif préférentiel pour les membres du Club MAJOR. Rendez-vous dans votre espace personnel pour vous inscrire.',
        priority: Priority.HIGH,
        expiresAt: expiresIn30,
      },
      {
        title:    'Nouvelle séance fractionné — Vendredi 18h',
        content:  'Le coach Youssef Idrissi annonce une nouvelle séance fractionné tous les vendredis à 18h00 au Stade Municipal. Ouverte aux groupes Élite et Intermédiaire. Inscriptions dans votre planning.',
        priority: Priority.NORMAL,
        expiresAt: expiresIn30,
      },
      {
        title:    'Rappel cotisations — Saison 2024-2025',
        content:  'Rappel : la date limite de règlement des cotisations annuelles est fixée au 30 avril 2025. Membres en retard, régularisez votre situation via votre espace personnel ou auprès du bureau.',
        priority: Priority.URGENT,
        expiresAt: expiresIn30,
      },
      {
        title:    'Bienvenue aux nouveaux membres !',
        content:  'Le Club MAJOR souhaite la bienvenue à tous les nouveaux adhérents de la saison ! N\'hésitez pas à contacter votre coach et à rejoindre votre groupe. Ensemble, allons plus loin !',
        priority: Priority.NORMAL,
      },
    ],
  })
  console.log('✅  Annonces créées')

  // ── 11. Blog — Catégories ─────────────────────────────────
  const catEntrainement = await prisma.blogCategory.create({
    data: { name: 'Entraînement', slug: 'entrainement', color: '#2D8C6E', icon: 'Activity' },
  })
  const catPhysiologie = await prisma.blogCategory.create({
    data: { name: 'Physiologie', slug: 'physiologie', color: '#3ABFBF', icon: 'Heart' },
  })
  const catEquipement = await prisma.blogCategory.create({
    data: { name: 'Équipement', slug: 'equipement', color: '#4CAF82', icon: 'Footprints' },
  })
  const catNutrition = await prisma.blogCategory.create({
    data: { name: 'Nutrition', slug: 'nutrition', color: '#1A5C47', icon: 'Apple' },
  })
  const catDebuter = await prisma.blogCategory.create({
    data: { name: 'Débuter', slug: 'debuter', color: '#F59E0B', icon: 'Star' },
  })
  console.log('✅  Catégories blog créées')

  // ── 12. Blog — Articles ───────────────────────────────────
  await prisma.blogPost.createMany({
    data: [
      {
        title:      'Comprendre la VMA : la clé de votre progression',
        slug:       'comprendre-vma-course-pied',
        excerpt:    'La Vitesse Maximale Aérobie (VMA) est le concept central de tout programme d\'entraînement sérieux. Comprendre ce qu\'elle est et comment l\'utiliser peut transformer votre pratique du running.',
        coverImage: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
        categoryId: catPhysiologie.id,
        readTime:   7,
        published:  true,
        publishedAt: new Date('2025-01-15'),
        tags: ['VMA', 'physiologie', 'entraînement', 'progression'],
        content: `
# Comprendre la VMA : la clé de votre progression

## Qu'est-ce que la VMA ?

La **Vitesse Maximale Aérobie** (VMA) représente la vitesse minimale à laquelle votre organisme consomme sa quantité maximale d'oxygène (VO2max). C'est le point de bascule entre le travail aérobie et anaérobie.

En pratique, c'est la vitesse à laquelle vous pouvez courir en utilisant pleinement vos capacités cardio-respiratoires, pendant environ 6 à 8 minutes pour un coureur entraîné.

## Comment mesurer sa VMA ?

### Le test de Brue (demi-Cooper)
Le test le plus courant en club. Vous courez 6 minutes à vitesse maximale. La distance parcourue divisée par 0,1 vous donne votre VMA en km/h.

**Exemple :** 1 400 m en 6 minutes → VMA = 1 400 / 100 = **14 km/h**

### Le test sur piste progressif
Départ lent, augmentation de la vitesse toutes les 3 minutes. La VMA correspond à la vitesse de la dernière palière tenue complètement.

## Les zones d'entraînement basées sur la VMA

| Zone | % VMA | Sensation | Objectif |
|------|--------|-----------|----------|
| Endurance fondamentale | 60-70% | Conversation aisée | Base aérobie |
| Allure marathon | 75-80% | Effort contrôlé | Spécifique compétition |
| Seuil anaérobie | 85-90% | Difficile mais tenable | Augmenter le seuil |
| VMA | 95-105% | Très difficile | Améliorer VO2max |

## L'entraînement fractionné basé sur la VMA

Le fractionné à VMA est l'outil principal pour progresser. Quelques exemples :

- **10 × 30/30** : 30 secondes à 100-110% VMA, 30 secondes de récupération
- **6 × 1 minute** : 1 minute à 100% VMA, 1 minute de récupération
- **5 × 2 minutes** : 2 minutes à 95-100% VMA, 2 minutes de récupération

## Conseils pratiques du Club MAJOR

> "La VMA n'est pas une destination, c'est un outil. Ce qui compte, c'est l'évolution dans le temps." — *Coach Youssef Idrissi*

1. **Testez votre VMA** au minimum deux fois par an (début et milieu de saison)
2. **Progressez graduellement** : augmentation de l'intensité de 5-10% maximum par mois
3. **Récupérez bien** : les séances VMA demandent au moins 48h de récupération
4. **Combinez** fractionné VMA et endurance fondamentale dans votre programme

## Conclusion

Connaître et travailler sa VMA permet de structurer intelligemment son entraînement. Rejoignez nos séances fractionné du vendredi avec le coach Idrissi pour progresser dans un cadre encadré et motivant !
        `,
      },
      {
        title:      'VO2max : comprendre votre moteur aérobie',
        slug:       'vo2max-moteur-aerobie-running',
        excerpt:    'Le VO2max mesure la capacité maximale de votre organisme à consommer l\'oxygène pendant l\'effort. Découvrez ce que c\'est, comment l\'améliorer et pourquoi il est si important pour les coureurs.',
        coverImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
        categoryId: catPhysiologie.id,
        readTime:   6,
        published:  true,
        publishedAt: new Date('2025-01-28'),
        tags: ['VO2max', 'physiologie', 'aérobie', 'science'],
        content: `
# VO2max : comprendre votre moteur aérobie

## Définition

Le **VO2max** (volume maximal d'oxygène consommé par minute) est la mesure de la capacité maximale de transport et d'utilisation de l'oxygène par l'organisme lors d'un effort intense.

Il s'exprime en **millilitres d'oxygène par kilogramme de poids corporel par minute** (mL/kg/min).

## Les valeurs de référence

| Niveau | Hommes | Femmes |
|--------|--------|--------|
| Sédentaire | 35-40 | 28-35 |
| Actif | 42-50 | 35-44 |
| Coureur amateur | 50-60 | 44-54 |
| Semi-élite | 60-70 | 55-62 |
| Élite mondiale | 75-90 | 65-77 |

*Eliud Kipchoge, recordman du monde du marathon, possède un VO2max estimé à 85 mL/kg/min.*

## VO2max vs VMA : quelle différence ?

Ces deux valeurs sont liées mais distinctes :

- **VO2max** = capacité biologique absolue d'utilisation d'O₂
- **VMA** = vitesse de course à laquelle le VO2max est atteint

Un coureur avec un VO2max élevé mais une économie de course médiocre peut être dépassé par quelqu'un avec un VO2max plus bas mais très efficace.

## Comment améliorer son VO2max ?

### Les entraînements les plus efficaces

1. **Fractionné long** (2-4 minutes à 95-100% VMA) : le plus efficace pour stimuler le VO2max
2. **Tempo runs** (20-40 min à 85% VMA) : travail au seuil anaérobie
3. **Sortie longue** (60-90 min à 70% VMA) : améliore la capacité cardiaque sur le long terme

### Ce qui influence le VO2max

- **Génétique** : environ 50% est inné
- **Entraînement** : 20-30% d'amélioration possible avec un entraînement adapté
- **Âge** : diminue naturellement après 35 ans (~1% par an), mais l'entraînement ralentit cette baisse
- **Altitude** : l'entraînement en altitude stimule la production de globules rouges

## L'économie de course : l'autre facteur clé

Le VO2max ne détermine pas tout. **L'économie de course** (la quantité d'oxygène utilisée pour maintenir une vitesse donnée) est tout aussi importante.

Un bon entraînement technique — foulée, posture, respiration — améliore l'économie de course et permet de courir plus vite avec le même VO2max.

## Programme MAJOR pour améliorer votre VO2max

Rejoignez nos séances spécifiques :
- **Mardi** : Fractionné long (groupe Élite & Intermédiaire)
- **Vendredi** : 30/30 VMA (tous groupes)
- **Dimanche** : Sortie longue (groupe Loisir & Intermédiaire)
        `,
      },
      {
        title:      'Les types d\'entraînement en course à pied : guide complet',
        slug:       'types-entrainement-course-pied',
        excerpt:    'Endurance fondamentale, fractionné, sortie longue, renforcement... Chaque type d\'entraînement a son rôle précis. Ce guide vous explique tout pour structurer votre semaine de running intelligemment.',
        coverImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
        categoryId: catEntrainement.id,
        readTime:   9,
        published:  true,
        publishedAt: new Date('2025-02-10'),
        tags: ['entraînement', 'fractionné', 'endurance', 'programme'],
        content: `
# Les types d'entraînement en course à pied : guide complet

Un programme de running efficace alterne plusieurs types d'entraînement. Chacun cible des adaptations physiologiques spécifiques. Voici le guide complet utilisé au Club MAJOR.

## 1. Endurance Fondamentale (EF)

**Intensité :** 60-70% de la FCmax / 60-70% VMA
**Durée :** 45 min à 2h
**Sensation :** Vous pouvez tenir une conversation complète

C'est le **socle de tout entraînement**. L'endurance fondamentale développe :
- Le réseau capillaire musculaire
- L'utilisation des graisses comme carburant
- La récupération active

> **Règle d'or :** 70-80% de votre volume total d'entraînement devrait être en EF.

## 2. Fractionné (Intervalles)

**Intensité :** 90-110% VMA
**Durée :** Sessions de 30 min à 1h (dont 15-25 min de travail effectif)
**Sensation :** Difficile, respiration haletante, impossible de parler

Le fractionné améliore directement la VMA et le VO2max. Les formats courants :

- **30/30** : 30s vite / 30s lent — idéal débutants
- **1'/1'** : 1 min à VMA / 1 min récup — intermédiaires
- **2'/2'** et **3'/3'** : pour les avancés

## 3. Sortie Longue

**Intensité :** 65-75% FCmax
**Durée :** 1h30 à 3h (selon niveau)
**Fréquence :** 1 fois par semaine maximum

La sortie longue est **indispensable pour les marathoniens**. Elle :
- Épuise les réserves de glycogène et force le corps à utiliser les lipides
- Renforce le système musculo-squelettique
- Développe la résistance mentale

## 4. Allure Spécifique (Seuil)

**Intensité :** 85-90% FCmax / 80-88% VMA
**Durée :** 20 à 40 minutes de travail continu
**Sensation :** Effort soutenu, difficile de parler

Idéal pour les coureurs qui préparent une compétition. On court à l'allure cible (ou légèrement en dessous) pendant des blocs de 10-20 minutes.

## 5. Récupération Active

**Intensité :** < 60% FCmax
**Durée :** 20 à 40 minutes
**Quand :** Lendemain d'une séance intense

Une sortie très légère favorise la circulation sanguine et accélère la récupération. Ne jamais négliger la récupération !

## 6. Renforcement Musculaire

**Fréquence :** 2x par semaine
**Exercices clés :** Gainage, squats, fentes, mollets, proprioception

Le renforcement prévient les blessures et améliore l'économie de course. Au Club MAJOR, nous intégrons des séances spécifiques le lundi et le jeudi.

## La semaine type au Club MAJOR

| Jour | Séance | Durée |
|------|--------|-------|
| Lundi | Renforcement + footing léger | 45 min |
| Mardi | Fractionné | 1h |
| Mercredi | Endurance fondamentale | 1h |
| Jeudi | Repos ou yoga | — |
| Vendredi | Fractionné VMA 30/30 | 1h |
| Samedi | Allure spécifique | 1h15 |
| Dimanche | Sortie longue | 1h30-2h |
        `,
      },
      {
        title:      'Comment choisir ses chaussures de running ?',
        slug:       'choisir-chaussures-running',
        excerpt:    'Avec des centaines de modèles disponibles, choisir ses chaussures de running peut sembler complexe. Voici les critères essentiels pour faire le bon choix et courir sans blessure.',
        coverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        categoryId: catEquipement.id,
        readTime:   8,
        published:  true,
        publishedAt: new Date('2025-02-25'),
        tags: ['chaussures', 'équipement', 'blessures', 'conseil'],
        content: `
# Comment choisir ses chaussures de running ?

Choisir les bonnes chaussures de running est probablement **la décision la plus importante** pour un coureur. Une mauvaise chaussure peut provoquer des blessures, une bonne peut transformer votre pratique.

## Étape 1 : Analyser votre foulée

### Pronation : neutre, sous-pronation ou sur-pronation ?

La **pronation** est le mouvement naturel d'amortissement du pied. Elle se mesure en regardant l'usure de vos semelles.

| Type | Description | Usure | Chaussure recommandée |
|------|-------------|-------|----------------------|
| Neutre | Pied bien aligné | Centrale | Chaussure standard |
| Sous-pronateur (supinateur) | Pied penche vers l'extérieur | Extérieure | Chaussure avec amorti neutre |
| Sur-pronateur | Pied penche vers l'intérieur | Intérieure | Chaussure stabilisatrice |

**Test simple** : Faites mouiller votre pied et posez-le sur du papier. La forme de l'empreinte indique votre type de voûte plantaire.

## Étape 2 : Définir l'usage

### Route vs Trail

- **Route** : semelle lisse, légèreté, amorti sur asphalte
- **Trail** : crampons pour l'accroche, protection, robustesse
- **Mixte** : compromis polyvalent

### Distance et volume

- **Petites distances / vitesse** : chaussure légère, Drop faible (4-6mm)
- **Marathon / longues distances** : amorti important, Drop moyen (8-10mm)
- **Débutant** : chaussure avec amorti et maintien généreux

## Étape 3 : Comprendre les caractéristiques techniques

### Le Drop (différentiel talon/avant-pied)

Le drop est la différence de hauteur entre le talon et l'avant-pied :

- **Drop élevé (10-12mm)** : protection maximale, idéal débutants
- **Drop moyen (6-8mm)** : polyvalent, populaire
- **Drop faible (0-4mm)** : engagement de l'avant-pied, pour coureurs expérimentés

### L'amorti

- **Amorti fort** : protège les articulations, idéal longues distances
- **Amorti léger** : retour d'énergie, sensation de sol, pour la vitesse

### La largeur

Votre pied gonfle à l'effort. Prévoyez **1 à 1,5 cm** de jeu en bout de chaussure. Certaines marques proposent des largeurs larges (2E, 4E).

## Les marques populaires et leurs points forts

- **Asics** : excellence pour la correction de pronation (Gel-Kayano, GT-2000)
- **Brooks** : confort longues distances (Ghost, Glycerin)
- **New Balance** : chaussures larges, bon rapport qualité/prix (1080, 1260)
- **Saucony** : légèreté et réactivité (Kinvara, Ride)
- **Hoka One One** : amorti maximaliste, trail (Clifton, Speedgoat)
- **Nike / Adidas** : performance et vitesse (Vaporfly, Adizero)

## Conseils pratiques

1. **Essayez en magasin spécialisé** avec une analyse de foulée
2. **Essayez en fin de journée** quand le pied est légèrement gonflé
3. **Portez vos chaussettes de running** lors de l'essai
4. **Alternez 2 paires** pour prolonger leur durée de vie
5. **Renouvelez tous les 600-800 km** (environ 6-12 mois selon fréquence)

## Entretien des chaussures

- Nettoyez à la main avec de l'eau froide et une brosse douce
- Séchez à l'air libre, jamais au sèche-cheveux ou près d'un radiateur
- Utilisez-les uniquement pour la course (ne pas les porter en ville)

> Au Club MAJOR, nous organisons des sessions d'analyse de foulée gratuites pour tous nos membres. Renseignez-vous auprès de votre coach !
        `,
      },
      {
        title:      'Débuter la course à pied intelligemment : guide du débutant',
        slug:       'debuter-course-pied-guide-debutant',
        excerpt:    'Vous souhaitez vous mettre à la course à pied ? Félicitations ! Voici un guide complet pour démarrer intelligemment, progresser sans blessure et prendre du plaisir dès les premières semaines.',
        coverImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
        categoryId: catDebuter.id,
        readTime:   10,
        published:  true,
        publishedAt: new Date('2025-03-05'),
        tags: ['débutant', 'programme', 'conseil', 'motivation'],
        content: `
# Débuter la course à pied intelligemment

Bienvenue dans le monde merveilleux de la course à pied ! Que vous souhaitiez perdre du poids, améliorer votre condition physique, ou simplement courir votre premier 5 km, ce guide est fait pour vous.

## Les erreurs classiques du débutant (à éviter absolument)

### 1. Partir trop vite
C'est **l'erreur numéro 1**. Les débutants courent trop vite, s'essoufflent en 3 minutes, souffrent, abandonnent.

> **Règle :** Si vous ne pouvez pas tenir une conversation en courant, vous allez trop vite. Ralentissez.

### 2. Courir trop souvent
Votre corps a besoin de récupération. Commencez par **2-3 sorties par semaine** maximum, avec au minimum 1 jour de repos entre chaque.

### 3. Négliger les chaussures
Investissez dans une vraie paire de chaussures de running adaptée à votre foulée. C'est la dépense la plus importante.

### 4. Sauter l'échauffement
5 minutes de marche rapide avant de courir préparent le système cardio-vasculaire et les muscles.

## Programme débutant 8 semaines : du canapé au 30 minutes

### Principe : Marche-Course (Run/Walk)

Le principe est simple : alterner marche et course pour habituer progressivement le corps.

| Semaine | Séance | Structure |
|---------|--------|-----------|
| 1-2 | 3x/semaine | 1 min course / 2 min marche × 8 (24 min) |
| 3-4 | 3x/semaine | 2 min course / 2 min marche × 6 (24 min) |
| 5-6 | 3x/semaine | 5 min course / 2 min marche × 4 (28 min) |
| 7   | 3x/semaine | 10 min course / 2 min marche × 2 (24 min) |
| 8   | 3x/semaine | 20-30 min course continue |

## Les bases pour bien courir

### La posture
- Dos droit, regard à 10-15 m devant vous
- Épaules basses et détendues
- Bras à 90°, mains légèrement fermées
- Légère inclinaison vers l'avant (pas courbé !)

### La respiration
- Respirez par le nez ET la bouche simultanément
- Rythme régulier : 3 pas inspiration / 2 pas expiration
- Ne jamais retenir sa respiration

### La foulée
- Attaque milieu de pied (ni talon ni avant-pied prononcé)
- Foulée courte plutôt que longue (évite les blessures)
- Cadence cible : 170-180 pas/minute

## Alimentation et hydratation

### Avant la course
- Dernier repas complet : 2-3h avant
- Collation légère possible 30-45 min avant (banane, barre)
- **Hydratez-vous bien** dans les heures précédentes

### Pendant
- Moins d'1h : eau suffisante
- Plus d'1h : eau + électrolytes (sels minéraux)

### Après
- Collation protéines + glucides dans les 30 min (yaourt + fruit, œufs + pain)
- Réhydratation : 1,5x le poids perdu en eau

## Les signes qu'il faut s'arrêter

- Douleur articulaire (genou, cheville, hanche) → consultez
- Douleur thoracique ou essoufflement anormal → arrêtez, consultez
- Douleur de côté persistante → marchez jusqu'à disparition

## Rejoindre le Club MAJOR pour progresser

La course à pied seule, c'est bien. En groupe, c'est encore mieux ! Le Club MAJOR propose :

- **Groupe débutant** encadré par la coach Fatima Benkirane
- Sorties conviviales du dimanche matin
- Conseils personnalisés et suivi de progression
- Ambiance fraternelle et motivante

> *"Peu importe votre vitesse, vous êtes toujours plus rapide que ceux qui sont restés sur le canapé."*

Rejoignez-nous et commencez votre aventure running avec MAJOR !
        `,
      },
      {
        title:      'Courir régulièrement : le meilleur remède que votre médecin n\'a pas encore prescrit',
        slug:       'bienfaits-course-pied-sante-medecin',
        excerpt:    'Tension artérielle, diabète, dépression, douleurs chroniques, immunité… La science est formelle : pratiquer la course à pied régulièrement est l\'un des actes de santé les plus puissants qui soit — et il ne coûte qu\'une paire de chaussures.',
        coverImage: 'https://images.unsplash.com/photo-1486218119243-13301084eb72?w=800',
        categoryId: catPhysiologie.id,
        readTime:   8,
        published:  true,
        publishedAt: new Date('2026-04-01'),
        tags: ['santé', 'prévention', 'bienfaits', 'médecine', 'motivation'],
        content: `
# Courir régulièrement : le meilleur remède que votre médecin n'a pas encore prescrit

> *"La meilleure thérapie coûte une paire de chaussures."* — L'esprit Club MAJOR

## Ce que la science dit (et ce que les coureurs savent depuis longtemps)

La recherche médicale est sans équivoque : pratiquer la course à pied régulièrement — même à faible intensité — réduit significativement le risque de développer les maladies les plus coûteuses en soins médicaux.

Voici les faits, chiffres à l'appui.

---

## 1. Cœur et tension artérielle

La course à pied est l'entraînement cardiovasculaire par excellence.

- **-45%** de risque de maladies cardiovasculaires chez les coureurs réguliers *(American College of Cardiology, 2014)*
- **-30%** de risque de mortalité par maladie cardiaque avec seulement 5 à 10 minutes de course par jour à allure lente
- La tension artérielle baisse en moyenne de **4 à 9 mmHg** après 3 mois de pratique régulière

> Un coureur de 40 ans qui court 3 fois par semaine a un cœur biologiquement plus jeune de 10 ans que son sédentaire voisin.

---

## 2. Diabète de type 2 et métabolisme

La course à pied améliore la sensibilité à l'insuline et régule la glycémie.

- **-50%** de risque de diabète de type 2 pour les coureurs réguliers *(étude Harvard, 2011)*
- **20 minutes de footing** à intensité modérée suffisent à améliorer la glycémie post-repas
- Effet durable : les bénéfices métaboliques persistent plusieurs jours après une séance

Pour les personnes déjà diabétiques, la marche rapide et le jogging font partie des traitements recommandés par l'OMS au même titre que certains médicaments.

---

## 3. Santé mentale : l'antidépresseur naturel

C'est peut-être l'effet le moins connu, mais le plus puissant.

- La course libère des **endorphines, dopamine et sérotonine** — les mêmes neurotransmetteurs ciblés par les antidépresseurs
- **-30%** de symptômes dépressifs après 8 semaines de pratique *(méta-analyse JAMA, 2023)*
- Réduction mesurable de l'anxiété après **une seule séance de 20 minutes**
- Les coureurs déclarent un meilleur sommeil, moins de ruminations, et une perception plus positive d'eux-mêmes

> "Je dors mieux, je stress moins, et je mange mieux depuis que je cours avec MAJOR. J'ai arrêté deux médicaments en accord avec mon médecin." — *Témoignage d'un membre du club*

---

## 4. Système immunitaire et résistance aux infections

- Une pratique modérée (30-50 min, 3-4 fois/semaine) augmente l'activité des cellules NK *(Natural Killer)* — la première ligne de défense immunitaire
- Les coureurs modérés font **43% moins de maladies respiratoires** que les sédentaires *(étude BJSM, 2011)*
- L'inflammation chronique — à la base de nombreuses maladies modernes — est **réduite** par la pratique régulière

**Attention :** l'excès (compétition intensive sans récupération) peut avoir l'effet inverse. Le juste milieu, c'est précisément ce que prône le Club MAJOR.

---

## 5. Os, articulations et prévention des douleurs chroniques

Contrairement à une idée reçue, courir **renforce** les articulations plutôt que de les user.

- La densité osseuse augmente avec la pratique : **-40%** de risque d'ostéoporose
- Le cartilage du genou est **mieux nourri** chez les coureurs que chez les sédentaires *(Stanford University, 2017)*
- Les lombalgies chroniques sont réduites grâce au renforcement des muscles du dos et du core

> Le running ne détruit pas vos genoux. Le surpoids, la sédentarité et la mauvaise posture, oui.

---

## 6. Espérance de vie : le chiffre qui parle

Une méta-analyse portant sur **230 000 personnes** publiée dans le *British Journal of Sports Medicine* a établi que :

- Les coureurs réguliers vivent en moyenne **3 ans de plus** que les non-coureurs
- Le gain d'espérance de vie est visible même avec **seulement 1 à 2 heures de course par semaine**
- Chaque heure de running "rapporte" environ **7 heures de vie supplémentaire**

---

## Ce que ça change concrètement pour votre portefeuille (et votre agenda médical)

Pratiquer la course à pied régulièrement, c'est statistiquement :

| Problème évité | Économie estimée (consultations + traitements / an) |
|---|---|
| Hypertension contrôlée | 300–800 Dhs |
| Diabète de type 2 prévenu | 2 000–5 000 Dhs |
| Dépression légère/modérée | 1 500–4 000 Dhs |
| Lombalgies réduites | 500–2 000 Dhs |
| Maladies respiratoires évitées | 400–1 200 Dhs |

Et ça, sans compter les gains en qualité de vie, en énergie quotidienne, et en confiance en soi.

---

## Alors, par où commencer ?

La bonne nouvelle : vous n'avez pas besoin d'être un athlète. **30 minutes, 3 fois par semaine, à allure conversationnelle** suffisent pour déclencher la plupart de ces effets bénéfiques.

La meilleure nouvelle : au Club MAJOR, vous n'êtes pas seul.

On court ensemble, on se motive, on rigole, on partage — et on finit la sortie avec un sourire que aucune ordonnance ne peut donner.

**Parce que la meilleure thérapie coûte une paire de chaussures. Et une bonne compagnie.**

---

*Sources : American College of Cardiology (2014), Harvard School of Public Health (2011), JAMA Psychiatry (2023), British Journal of Sports Medicine (2017, 2020), Stanford University (2017), OMS.*
        `,
      },
    ],
  })
  console.log('✅  Articles de blog créés')

  // ── 13. Notifications ────────────────────────────────────
  const allUsers = [adminUser, coachUser1, coachUser2, ...memberUsers]
  await Promise.all(
    allUsers.slice(0, 5).map(u =>
      prisma.notification.create({
        data: {
          userId:  u.id,
          title:   'Bienvenue sur la plateforme MAJOR !',
          message: 'Votre compte est actif. Explorez votre espace personnel et découvrez toutes les fonctionnalités.',
          type:    'SUCCESS',
          read:    false,
        },
      })
    )
  )
  console.log('✅  Notifications créées')

  console.log('\n🎉  Seed terminé avec succès !')
  console.log('\n📧  Comptes de connexion :')
  console.log('   Admin  : admin@clubmajor.ma / Admin@Major2025')
  console.log('   Coach  : youssef.coach@clubmajor.ma / Coach@2025')
  console.log('   Membre : mohammed.alami@email.ma / Member@2025')
}

main()
  .catch(e => { console.error('❌ Erreur seed :', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
