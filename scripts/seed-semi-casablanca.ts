// Seed du programme "Cap sur le semi de Casablanca" — octobre 2026.
// 3 semaines × 4 séances (A lun/mar · B mer/jeu · C ven/sam · D dimanche).
// Les allures sont déclinées sur les 4 niveaux VMA du site :
//   debutant      → VMA 12-13 (Découverte)
//   intermediaire → VMA 14-15
//   confirme      → VMA 16-17
//   competiteur   → VMA 18
//
// Usage :
//   LOCAL : npx tsx scripts/seed-semi-casablanca.ts
//   PROD  : npx tsx scripts/seed-semi-casablanca.ts --prod

import { PrismaClient } from '@prisma/client'

const PROD_URL  = 'postgresql://neondb_owner:npg_F4WBLe6rxZTm@ep-sweet-unit-amybnzup-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const LOCAL_URL = 'postgresql://postgres:Major@localhost:5432/clubmajor'

const isProd = process.argv.includes('--prod')
const prisma = new PrismaClient({ datasourceUrl: isProd ? PROD_URL : LOCAL_URL })

// ── Helpers date UTC ─────────────────────────────────────────────────
function d(day: number) { return new Date(Date.UTC(2026, 9, day, 7, 0, 0)) } // 2026-10-DD à 07:00 UTC

// ── Session type ─────────────────────────────────────────────────────
interface Levels {
  debutant:      { distance?: string; pace?: string; note?: string }
  intermediaire: { distance?: string; pace?: string; note?: string }
  confirme:      { distance?: string; pace?: string; note?: string }
  competiteur:   { distance?: string; pace?: string; note?: string }
}

interface SessionSeed {
  dateFrom:    Date
  dateTo?:     Date
  title:       string
  type:        'FRACTIONNE' | 'PREPARATION_COMPETITION' | 'RENFORCEMENT' | 'SORTIE_LONGUE' | 'ENDURANCE_FONDAMENTALE' | 'RECUPERATION'
  description: string
  levels:      Levels
}

// ── Données du programme ─────────────────────────────────────────────
const SESSIONS: SessionSeed[] = [
  // ===== SEMAINE 1 — Remise en charge spécifique (5 → 11 octobre) =====
  {
    dateFrom: d(5), dateTo: d(6),
    title: 'S1-A · VMA courte 30"/30" — Lundi 5 ou Mardi 6',
    type:  'FRACTIONNE',
    description: `⏱ ~55 min · Rail 1 : lun 5. Rail 2 : mar 6.

ÉCHAUFFEMENT (20 min)
  20 min EF + gammes athlétiques + 4 lignes droites progressives.

CORPS
  2 blocs de 8 × (30 s à 105 % VMA — 30 s trot).
  Récup 3 min entre les 2 blocs.

RETOUR AU CALME (10 min)
  10 min très souple + étirements légers.

👉 Sans VMA connue ? Remplacer le 2e bloc par un demi-Cooper (6 min à fond sur plat).
    VMA = distance en mètres ÷ 100.`,
    levels: {
      debutant: {
        distance: '2 × 8 × 30" rapide / 30" trot',
        pace: 'VMA 12-13 · 105 % = 4\'46 à 4\'24/km',
        note: 'Distance par 30 s : 105 à 115 m. EF échauff. 7\'42 à 7\'06/km.',
      },
      intermediaire: {
        distance: '2 × 8 × 30" rapide / 30" trot',
        pace: 'VMA 14-15 · 105 % = 4\'05 à 3\'49/km',
        note: 'Distance par 30 s : 125 à 130 m. EF échauff. 6\'36 à 6\'09/km.',
      },
      confirme: {
        distance: '2 × 8 × 30" rapide / 30" trot',
        pace: 'VMA 16-17 · 105 % = 3\'34 à 3\'22/km',
        note: 'Distance par 30 s : 140 à 150 m. EF échauff. 5\'46 à 5\'26/km.',
      },
      competiteur: {
        distance: '2 × 8 × 30" rapide / 30" trot',
        pace: 'VMA 18 · 105 % = 3\'10/km',
        note: 'Distance par 30 s : 160 m. EF échauff. 5\'08/km.',
      },
    },
  },
  {
    dateFrom: d(7), dateTo: d(8),
    title: 'S1-B · Allure semi 3 × 2 km — Mercredi 7 ou Jeudi 8',
    type:  'PREPARATION_COMPETITION',
    description: `⏱ ~1 h 05 · Rail 1 : mer 7. Rail 2 : jeu 8.

ÉCHAUFFEMENT (20 min)   20 min EF.
CORPS                    3 × 2 km à allure semi — récup 2 min en trot.
RETOUR AU CALME (10 min) 10 min EF.

⚠️ Séance de calibrage : l'allure ne se court pas au feeling.
Montre ou balise tous les 500 m. Écart toléré : ±5 s/km.`,
    levels: {
      debutant: {
        distance: '3 × 2 km (6 km effort)',
        pace: 'VMA 12-13 · Allure semi 85 % = 5\'53 à 5\'26/km',
        note: 'Temps par 2 km : 11\'46 à 10\'52. Récup 2 min.',
      },
      intermediaire: {
        distance: '3 × 2 km',
        pace: 'VMA 14-15 · Allure semi 85 % = 5\'03 à 4\'42/km',
        note: 'Temps par 2 km : 10\'05 à 9\'25.',
      },
      confirme: {
        distance: '3 × 2 km',
        pace: 'VMA 16-17 · Allure semi 85 % = 4\'25 à 4\'09/km',
        note: 'Temps par 2 km : 8\'49 à 8\'18.',
      },
      competiteur: {
        distance: '3 × 2 km',
        pace: 'VMA 18 · Allure semi 85 % = 3\'55/km',
        note: 'Temps par 2 km : 7\'51.',
      },
    },
  },
  {
    dateFrom: d(9), dateTo: d(10),
    title: 'S1-C · Force côtes courtes — Vendredi 9 ou Samedi 10',
    type:  'RENFORCEMENT',
    description: `⏱ ~1 h · Rail 1 : ven 9. Rail 2 : sam 10.

ÉCHAUFFEMENT (40 min)   40 min EF, respiration facile, conversation possible.
CORPS                    8 × 30 s en côte à effort soutenu. Retour en marchant.
                        Pas de chrono — la pente impose l'intensité.
RETOUR AU CALME (10 min) 10 min à plat, très souple.

💡 Les côtes renforcent sans traumatiser. Appui court, buste droit, bras actifs.`,
    levels: {
      debutant: {
        distance: '8 × 30 s en côte',
        pace: 'VMA 12-13 · EF 7\'42 à 7\'06/km',
        note: 'Effort perçu : soutenu mais contrôlé. Récup en marchant.',
      },
      intermediaire: {
        distance: '8 × 30 s en côte',
        pace: 'VMA 14-15 · EF 6\'36 à 6\'09/km',
        note: 'Appui court et dynamique. Récup en marchant.',
      },
      confirme: {
        distance: '8 × 30 s en côte',
        pace: 'VMA 16-17 · EF 5\'46 à 5\'26/km',
        note: 'Qualité de l\'impulsion > vitesse brute.',
      },
      competiteur: {
        distance: '8 × 30 s en côte',
        pace: 'VMA 18 · EF 5\'08/km',
        note: 'Puissance musculaire sans sur-régime cardiaque.',
      },
    },
  },
  {
    dateFrom: d(11),
    title: 'S1-D · Sortie longue club — Dimanche 11 (tous les groupes)',
    type:  'SORTIE_LONGUE',
    description: `⏱ ~1 h 20 · Tout le club court ensemble.

CORPS
  1 h 20 en EF, dont 2 × 10 min à allure semi placés sur la seconde moitié.
  Récup 4 min en EF entre les blocs allure semi.

BOISSON
  Une prise toutes les 20 min — pour tester le ravitaillement du jour J.

👉 On part ensemble et lentement. Les blocs à allure semi se courent par sous-groupes de VMA proche, puis on se regroupe sur la récupération.`,
    levels: {
      debutant: {
        distance: '1 h 20 total · 2 × 10 min allure semi',
        pace: 'VMA 12-13 · EF 7\'42-7\'06 · Semi 5\'53-5\'26/km',
        note: 'Distance / 10 min allure semi : 1700-1840 m.',
      },
      intermediaire: {
        distance: '1 h 20 · 2 × 10 min allure semi',
        pace: 'VMA 14-15 · EF 6\'36-6\'09 · Semi 5\'03-4\'42/km',
        note: 'Distance / 10 min allure semi : 1985-2125 m.',
      },
      confirme: {
        distance: '1 h 20 · 2 × 10 min allure semi',
        pace: 'VMA 16-17 · EF 5\'46-5\'26 · Semi 4\'25-4\'09/km',
        note: 'Distance / 10 min allure semi : 2265-2410 m.',
      },
      competiteur: {
        distance: '1 h 20 · 2 × 10 min allure semi',
        pace: 'VMA 18 · EF 5\'08 · Semi 3\'55/km',
        note: 'Distance / 10 min allure semi : 2550 m.',
      },
    },
  },

  // ===== SEMAINE 2 — Pic de charge (12 → 18 octobre) =====
  {
    dateFrom: d(12), dateTo: d(13),
    title: 'S2-A · VMA moyenne 10 × 400 m — Lundi 12 ou Mardi 13',
    type:  'FRACTIONNE',
    description: `⏱ ~1 h · Rail 1 : lun 12. Rail 2 : mar 13.

ÉCHAUFFEMENT (20 min)   20 min EF + 4 lignes droites.
CORPS                    2 blocs de 5 × 400 m à 95 % de VMA.
                        Récup 1 min entre répétitions · 3 min entre les 2 blocs.
RETOUR AU CALME (10 min) 10 min EF.

🎯 Régularité avant vitesse : les 10 × 400 m doivent tenir dans un écart de 3 secondes.
Si la fin se dégrade, c'est que c'est parti trop vite.`,
    levels: {
      debutant: {
        distance: '2 × (5 × 400 m)',
        pace: 'VMA 12-13 · 95 % = 5\'16 à 4\'51/km',
        note: 'Temps / 400 m : 2\'06 à 1\'57. Récup 1 min / 3 min entre blocs.',
      },
      intermediaire: {
        distance: '2 × (5 × 400 m)',
        pace: 'VMA 14-15 · 95 % = 4\'31 à 4\'13/km',
        note: 'Temps / 400 m : 1\'48 à 1\'41.',
      },
      confirme: {
        distance: '2 × (5 × 400 m)',
        pace: 'VMA 16-17 · 95 % = 3\'57 à 3\'43/km',
        note: 'Temps / 400 m : 1\'35 à 1\'29.',
      },
      competiteur: {
        distance: '2 × (5 × 400 m)',
        pace: 'VMA 18 · 95 % = 3\'31/km',
        note: 'Temps / 400 m : 1\'24.',
      },
    },
  },
  {
    dateFrom: d(14), dateTo: d(15),
    title: 'S2-B · Bloc spécifique 2 × 3 km — Mercredi 14 ou Jeudi 15',
    type:  'PREPARATION_COMPETITION',
    description: `⏱ ~1 h 05 · Rail 1 : mer 14. Rail 2 : jeu 15.

ÉCHAUFFEMENT (20 min)   20 min EF.
CORPS                    2 × 3 km à allure semi — récup 3 min en trot.
RETOUR AU CALME (10 min) 10 min EF.

⚠️ Dernière séance longue à l'allure cible en semaine.
Si le 2e bloc dérive de + 10 s/km, l'objectif est trop ambitieux : on révise l'allure du jour J.`,
    levels: {
      debutant: {
        distance: '2 × 3 km',
        pace: 'VMA 12-13 · Allure semi = 5\'53 à 5\'26/km',
        note: 'Temps / 3 km : 17\'39 à 16\'17. Récup 3 min.',
      },
      intermediaire: {
        distance: '2 × 3 km',
        pace: 'VMA 14-15 · Allure semi = 5\'03 à 4\'42/km',
        note: 'Temps / 3 km : 15\'08 à 14\'07.',
      },
      confirme: {
        distance: '2 × 3 km',
        pace: 'VMA 16-17 · Allure semi = 4\'25 à 4\'09/km',
        note: 'Temps / 3 km : 13\'14 à 12\'27.',
      },
      competiteur: {
        distance: '2 × 3 km',
        pace: 'VMA 18 · Allure semi = 3\'55/km',
        note: 'Temps / 3 km : 11\'46.',
      },
    },
  },
  {
    dateFrom: d(16), dateTo: d(17),
    title: 'S2-C · Endurance souple 50 min — Vendredi 16 ou Samedi 17',
    type:  'ENDURANCE_FONDAMENTALE',
    description: `⏱ ~55 min · Rail 1 : ven 16. Rail 2 : sam 17.

CORPS   50 min en EF strict. Aucune accélération, aucune exception.
FIN     6 lignes droites de 80 m en relâchement, récup complète entre chacune.

🧘 Récupération active placée la veille de la sortie clé : la tentation d'accélérer se paie dimanche.`,
    levels: {
      debutant: {
        distance: '50 min EF strict',
        pace: 'VMA 12-13 · EF = 7\'42 à 7\'06/km',
        note: 'Puis 6 × 80 m en relâchement. Récup complète entre les lignes droites.',
      },
      intermediaire: {
        distance: '50 min EF strict',
        pace: 'VMA 14-15 · EF = 6\'36 à 6\'09/km',
        note: 'Zone bavardage facile. 6 × 80 m en fin de séance.',
      },
      confirme: {
        distance: '50 min EF strict',
        pace: 'VMA 16-17 · EF = 5\'46 à 5\'26/km',
        note: 'EF strict = ne pas tirer. 6 × 80 m en relâchement.',
      },
      competiteur: {
        distance: '50 min EF strict',
        pace: 'VMA 18 · EF = 5\'08/km',
        note: 'Discipline absolue sur l\'allure. 6 × 80 m en fin.',
      },
    },
  },
  {
    dateFrom: d(18),
    title: 'S2-D · Sortie clé 3 × 15 min allure semi — Dimanche 18 (tous les groupes)',
    type:  'SORTIE_LONGUE',
    description: `⏱ ~1 h 30 · Tout le club court ensemble.

ÉCHAUFFEMENT (20 min)   20 min EF.
CORPS                    3 × 15 min à allure semi — récup 3 min en EF.
RETOUR AU CALME (15 min) 15 min EF.

🏁 La séance la plus importante des 3 semaines : 45 min cumulées à l'allure de course.
Tenue, chaussures et ravitaillement du jour J se testent ici — pas plus tard.`,
    levels: {
      debutant: {
        distance: '3 × 15 min allure semi (45 min cumulées)',
        pace: 'VMA 12-13 · Semi = 5\'53 à 5\'26/km',
        note: 'Distance / 15 min : 2550 à 2760 m. Récup 3 min EF.',
      },
      intermediaire: {
        distance: '3 × 15 min allure semi',
        pace: 'VMA 14-15 · Semi = 5\'03 à 4\'42/km',
        note: 'Distance / 15 min : 2975 à 3190 m.',
      },
      confirme: {
        distance: '3 × 15 min allure semi',
        pace: 'VMA 16-17 · Semi = 4\'25 à 4\'09/km',
        note: 'Distance / 15 min : 3400 à 3615 m.',
      },
      competiteur: {
        distance: '3 × 15 min allure semi',
        pace: 'VMA 18 · Semi = 3\'55/km',
        note: 'Distance / 15 min : 3825 m.',
      },
    },
  },

  // ===== SEMAINE 3 — Affûtage et course (19 → 25 octobre) =====
  {
    dateFrom: d(19), dateTo: d(20),
    title: 'S3-A · Rappel de vivacité — Lundi 19 ou Mardi 20',
    type:  'FRACTIONNE',
    description: `⏱ ~40 min · Rail 1 : lun 19. Rail 2 : mar 20.

ÉCHAUFFEMENT (15 min)   15 min EF.
CORPS                    10 × (30 s à 105 % VMA — 30 s trot). Un seul bloc.
RETOUR AU CALME (10 min) 10 min EF.

🎯 Volume divisé par deux, intensité conservée : c'est le volume qui fatigue, l'intensité qui entretient.`,
    levels: {
      debutant: {
        distance: '10 × 30"/30"',
        pace: 'VMA 12-13 · 105 % = 4\'46 à 4\'24/km',
        note: 'Distance / 30 s : 105 à 115 m.',
      },
      intermediaire: {
        distance: '10 × 30"/30"',
        pace: 'VMA 14-15 · 105 % = 4\'05 à 3\'49/km',
        note: 'Distance / 30 s : 125 à 130 m.',
      },
      confirme: {
        distance: '10 × 30"/30"',
        pace: 'VMA 16-17 · 105 % = 3\'34 à 3\'22/km',
        note: 'Distance / 30 s : 140 à 150 m.',
      },
      competiteur: {
        distance: '10 × 30"/30"',
        pace: 'VMA 18 · 105 % = 3\'10/km',
        note: 'Distance / 30 s : 160 m.',
      },
    },
  },
  {
    dateFrom: d(21), dateTo: d(22),
    title: 'S3-B · Dernier rappel d\'allure 3 × 1 500 m — Mercredi 21 ou Jeudi 22',
    type:  'PREPARATION_COMPETITION',
    description: `⏱ ~50 min · Rail 1 : mer 21. Rail 2 : jeu 22.

ÉCHAUFFEMENT (15 min)   15 min EF.
CORPS                    3 × 1 500 m à allure semi — récup 2 min.
RETOUR AU CALME (10 min) 10 min EF.

🎯 Ancrer la sensation de l'allure, pas chercher une performance.
Si ça paraît facile, c'est exactement le signe recherché.`,
    levels: {
      debutant: {
        distance: '3 × 1 500 m allure semi',
        pace: 'VMA 12-13 · Semi = 5\'53 à 5\'26/km',
        note: 'Temps / 1 500 m : 8\'49 à 8\'09. Récup 2 min.',
      },
      intermediaire: {
        distance: '3 × 1 500 m',
        pace: 'VMA 14-15 · Semi = 5\'03 à 4\'42/km',
        note: 'Temps / 1 500 m : 7\'34 à 7\'04.',
      },
      confirme: {
        distance: '3 × 1 500 m',
        pace: 'VMA 16-17 · Semi = 4\'25 à 4\'09/km',
        note: 'Temps / 1 500 m : 6\'37 à 6\'14.',
      },
      competiteur: {
        distance: '3 × 1 500 m',
        pace: 'VMA 18 · Semi = 3\'55/km',
        note: 'Temps / 1 500 m : 5\'53.',
      },
    },
  },
  {
    dateFrom: d(23), dateTo: d(24),
    title: 'S3-C · Déverrouillage — Vendredi 23 ou Samedi 24',
    type:  'RECUPERATION',
    description: `⏱ 20 à 30 min · Rail 1 : ven 23. Rail 2 : sam 24.

VENDREDI (Rail 1) : 25 à 30 min en EF très souple + 4 × 100 m progressifs.
SAMEDI  (Rail 2) : 20 min maximum en EF + 3 × 100 m progressifs, puis on rentre.

⚠️ Rail 2 : cette séance tombe la veille de la course.
On la raccourcit, on ne la saute pas — les jambes doivent être réveillées, pas sollicitées.`,
    levels: {
      debutant:      { distance: '20-30 min EF', pace: 'VMA 12-13 · EF = 7\'42 à 7\'06/km', note: '+ 3 à 4 × 100 m progressifs.' },
      intermediaire: { distance: '20-30 min EF', pace: 'VMA 14-15 · EF = 6\'36 à 6\'09/km', note: '+ 3 à 4 × 100 m progressifs.' },
      confirme:      { distance: '20-30 min EF', pace: 'VMA 16-17 · EF = 5\'46 à 5\'26/km', note: '+ 3 à 4 × 100 m progressifs.' },
      competiteur:   { distance: '20-30 min EF', pace: 'VMA 18 · EF = 5\'08/km',             note: '+ 3 à 4 × 100 m progressifs.' },
    },
  },
  {
    dateFrom: d(25),
    title: '🏁 S3-D · SEMI-MARATHON DE CASABLANCA · 21,097 km — Dimanche 25',
    type:  'PREPARATION_COMPETITION',
    description: `🏆 Jour J · Semi-marathon de Casablanca · 21,097 km

ÉCHAUFFEMENT
  10 min en EF + 3 lignes droites, terminé 15 min avant le départ.
  Rien de nouveau le jour J : ni chaussures, ni gel, ni tenue jamais testés.

PLAN DE COURSE
  Km 1 → 3  : Allure semi MOINS vite de 8 à 10 s/km.
               Le départ en peloton coûte toujours quelques secondes — on les laisse partir.
  Km 4 → 15 : Allure semi stricte. Boisson à chaque ravitaillement, même sans soif.
  Km 16 → 21 : On tient l'allure. Si bonnes sensations au km 18, on accélère progressivement jusqu'à l'arrivée.

Allez MAJOR ! 💚`,
    levels: {
      debutant: {
        distance: '21,097 km · Temps visé : 2h04 à 1h55',
        pace: 'VMA 12-13 · Km 1-3 : 6\'02-5\'35 · Km 4-21 : 5\'53-5\'26/km',
        note: 'Passage 10 km visé : 58\'49 à 54\'18.',
      },
      intermediaire: {
        distance: '21,097 km · Temps visé : 1h46 à 1h39',
        pace: 'VMA 14-15 · Km 1-3 : 5\'12-4\'51 · Km 4-21 : 5\'03-4\'42/km',
        note: 'Passage 10 km visé : 50\'25 à 47\'04.',
      },
      confirme: {
        distance: '21,097 km · Temps visé : 1h33 à 1h28',
        pace: 'VMA 16-17 · Km 1-3 : 4\'34-4\'18 · Km 4-21 : 4\'25-4\'09/km',
        note: 'Passage 10 km visé : 44\'07 à 41\'31.',
      },
      competiteur: {
        distance: '21,097 km · Temps visé : 1h23',
        pace: 'VMA 18 · Km 1-3 : 4\'04 · Km 4-21 : 3\'55/km',
        note: 'Passage 10 km visé : 39\'13.',
      },
    },
  },
]

const PROGRAM_DESCRIPTION = `🏁 PLAN D'ENTRAÎNEMENT · CAP SUR LE SEMI DE CASABLANCA · 21,097 km (dim. 25 octobre 2026)

Un seul programme pour tout le club. Les allures de chacun sont calculées sur sa VMA personnelle.

LE PRINCIPE
• Même séance, allures différentes : la structure et la durée de chaque séance sont identiques pour tout le monde. Un coureur à VMA 12 et un coureur à VMA 18 partent et finissent ensemble — seule la vitesse de chaque effort change.
• Deux rails, un seul programme : les adhérents dispos lundi/mercredi/vendredi ET ceux dispos mardi/jeudi/samedi font exactement les mêmes séances. Le dimanche, tout le club court ensemble. On ne cumule pas lundi ET mardi — c'est deux fois la même séance.

RÈGLES DU GROUPE
• Un rail, pas deux. Chacun choisit son rail en début de semaine.
• Trouver sa VMA : demi-Cooper (6 min à fond sur plat), VMA = distance en mètres ÷ 100. Ou estimation : VMA ≈ (vitesse 10 km récente) ÷ 0,90.
• Signaux d'alerte : allure semi qui devient pénible, sommeil dégradé ou pouls élevé → on remplace la séance par 30 min d'EF et on prévient l'encadrement.
• Douleur articulaire qui persiste après l'échauffement = arrêt de la séance.

ALLURES À RETENIR
• EF           65 % VMA  — on parle en courant
• Allure semi  85 % VMA  — l'allure du 25 octobre
• Allure 10K   90 % VMA  — repère de seuil
• VMA moyenne  95 % VMA  — fractions de 400 m
• VMA courte  105 % VMA  — fractions de 30 s

Allez MAJOR ! 💚🏃‍♂️`

async function main() {
  console.log(`🔄 Seed du programme Semi Casablanca sur ${isProd ? 'PROD' : 'LOCAL'}…\n`)

  // Upsert du TrainingProgram
  const program = await prisma.trainingProgram.upsert({
    where: { month_year: { month: 10, year: 2026 } },
    create: {
      month: 10, year: 2026,
      title: 'Cap sur le semi de Casablanca',
      description: PROGRAM_DESCRIPTION,
      whatsappGroup: null,
    },
    update: {
      title: 'Cap sur le semi de Casablanca',
      description: PROGRAM_DESCRIPTION,
    },
  })
  console.log(`✅ Programme ${program.month}/${program.year} prêt (id ${program.id})`)

  // On supprime les sessions existantes du programme pour tout rejouer proprement
  const del = await prisma.trainingProgramSession.deleteMany({ where: { programId: program.id } })
  if (del.count > 0) console.log(`🗑  ${del.count} ancienne(s) session(s) supprimée(s).`)

  // Insertion des 12 nouvelles séances
  let n = 0
  for (const s of SESSIONS) {
    await prisma.trainingProgramSession.create({
      data: {
        programId:   program.id,
        dateFrom:    s.dateFrom,
        dateTo:      s.dateTo ?? null,
        title:       s.title,
        type:        s.type as any,
        description: s.description,
        levels:      s.levels as any,
      },
    })
    n++
  }
  console.log(`✅ ${n} séance(s) créée(s).`)

  const total = await prisma.trainingProgramSession.count({ where: { programId: program.id } })
  console.log(`\n📊 Programme Oct 2026 : ${total} séance(s) au total.`)
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
