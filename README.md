# Club MAJOR — Plateforme Web

Application web full-stack pour le **Club MAJOR** (Mazagan Athlétisme Jogging And Organisation), club de course à pied basé à El Jadida, Maroc.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript strict |
| Style | Tailwind CSS + design system custom |
| Base de données | PostgreSQL via Prisma ORM |
| Auth | NextAuth v5 (Auth.js) — JWT |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Dates | date-fns (locale FR) |
| Notifications | react-hot-toast |

## Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou pnpm

## Installation

```bash
# 1. Cloner le projet
git clone <repo-url> && cd Site_Major

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (DATABASE_URL, NEXTAUTH_SECRET, ...)

# 4. Créer la base de données et appliquer le schéma
npx prisma migrate dev --name init

# 5. Peupler avec les données de démo
npx prisma db seed

# 6. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

```env
DATABASE_URL="postgresql://user:password@localhost:5432/clubmajor"
NEXTAUTH_SECRET="votre-secret-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@clubmajor.ma | Admin@Major2025 |
| Coach | youssef.coach@clubmajor.ma | Coach@2025 |
| Membre | mohammed.alami@email.com | Member@2025 |

## Arborescence

```
app/
├── (public)/          # Site vitrine (layout avec header/footer)
│   ├── page.tsx       # Homepage
│   ├── about/         # À propos
│   ├── events/        # Événements publics
│   ├── blog/          # Blog + articles
│   ├── coach-major/   # Page chatbot IA
│   └── contact/       # Formulaire contact
├── (auth)/            # Pages d'authentification (layout centré)
│   ├── login/
│   └── register/
├── (member)/          # Espace membre (sidebar membre)
│   └── member/
│       ├── dashboard/
│       ├── profile/
│       └── payments/
├── (coach)/           # Espace coach (sidebar admin)
│   └── coach/
│       └── dashboard/
├── (admin)/           # Espace admin (sidebar admin)
│   └── admin/
│       ├── dashboard/
│       ├── members/
│       ├── events/
│       ├── payments/
│       └── trainings/
└── api/
    ├── auth/
    │   ├── [...nextauth]/  # NextAuth handlers
    │   └── register/       # Inscription
    ├── chatbot/            # Coach MAJOR IA
    ├── members/            # CRUD membres
    ├── events/             # CRUD événements
    └── payments/           # CRUD paiements

components/
├── ui/
│   ├── logo.tsx        # Logo avec fallback SVG
│   ├── badge.tsx       # Badges de statut
│   └── stat-card.tsx   # Cartes statistiques
├── layout/
│   ├── public-header.tsx   # Header public (scroll-aware)
│   ├── public-footer.tsx   # Footer public
│   ├── admin-sidebar.tsx   # Sidebar admin/coach
│   └── member-sidebar.tsx  # Sidebar membre
└── chatbot/
    └── chatbot-widget.tsx  # Widget flottant Coach MAJOR

prisma/
├── schema.prisma       # Schéma BDD complet
└── seed.ts             # Données de démo
```

## Modèle de données (résumé)

```
User ──< Member ──< Payment
                ──< Attendance
                ──< EventRegistration >── Event
     ──< Coach  ──< TrainingSession ──< Attendance
                ──< TrainingGroup ──< Member
BlogCategory ──< BlogPost
ChatbotLog
Notification
Announcement
```

## Rôles et accès

| Route | ADMIN | COACH | MEMBER | Public |
|-------|-------|-------|--------|--------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/events`, `/blog` | ✅ | ✅ | ✅ | ✅ |
| `/member/*` | ✅ | ✅ | ✅ | ❌ |
| `/coach/*` | ✅ | ✅ | ❌ | ❌ |
| `/admin/*` | ✅ | ❌ | ❌ | ❌ |

## Commandes utiles

```bash
npm run dev          # Serveur dev (http://localhost:3000)
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # ESLint

npx prisma studio    # Interface graphique BDD
npx prisma migrate dev --name <nom>   # Nouvelle migration
npx prisma db seed   # Re-seeder la BDD
npx prisma db push   # Push schéma sans migration (dev rapide)
```

## Palette de couleurs

| Variable | Hex | Usage |
|----------|-----|-------|
| `major-primary` | `#2D8C6E` | Vert principal, CTA |
| `major-dark` | `#1A5C47` | Vert foncé, hover |
| `major-cyan` | `#3ABFBF` | Accent secondaire |
| `major-accent` | `#4CAF82` | Vert clair, textes accentués |
| `major-black` | `#0D0D0D` | Fond principal |
| `major-surface` | `#1A1A2E` | Fond cartes |

## Coach MAJOR (Chatbot)

Le chatbot répond aux questions sur le running via une base de connaissances en mémoire (keyword matching). Pour activer un vrai modèle IA :

1. Ajouter `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY` dans `.env`
2. Remplacer la logique dans `app/api/chatbot/route.ts` par un appel à l'API souhaitée
3. Le widget `ChatbotWidget` est déjà prêt côté client

## Recommandations V2

- **Paiement en ligne** : intégration CMI (Maroc) ou Stripe
- **App mobile** : React Native ou PWA
- **Résultats de courses** : import CSV chronométreur + classements
- **Calendrier interactif** : FullCalendar pour les séances
- **Notifications email** : Resend/SendGrid pour confirmations d'inscription
- **Analytics** : dashboard Recharts avec filtres temporels avancés
- **Export PDF** : attestations d'adhésion et reçus de paiement

---

**Club MAJOR** · El Jadida (Mazagan), Maroc · contact@clubmajor.ma
