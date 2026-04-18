import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Créer la catégorie "Événements & Courses" si elle n'existe pas
  let category = await prisma.blogCategory.findUnique({ where: { slug: 'evenements-courses' } })
  if (!category) {
    category = await prisma.blogCategory.create({
      data: {
        name:  'Événements & Courses',
        slug:  'evenements-courses',
        color: '#2D8C6E',
        icon:  'Trophy',
      },
    })
  }

  const content = `
## Une aventure au cœur du Haut Atlas

Ce week-end des 18 et 19 avril 2026, l'équipe MAJOR a relevé l'un des défis les plus exigeants du calendrier trail marocain : le **SONASID HIGH ATLAS ULTRA-TRAIL® — HAUT 2026**, une course en pleine nature entre le village d'Imlil et Ouirgane, à travers les cols, cascades et sentiers mythiques du Haut Atlas.

Un événement complet — sold-out des semaines avant le départ — qui rassemble des milliers de passionnés de trail venus des quatre coins du Maroc et d'ailleurs.

---

## 🏔️ Le Grand Challenge 120 km : nos deux vétérans à l'honneur

La fierté de cette édition, c'est sans conteste la participation de nos deux **vétérans** dans la distance reine de la course : **le HAUT 120 — 120 kilomètres** avec des dénivelés entre 1 000 m et 3 000 m d'altitude.

**Mr. BOULGHAIT Mohammed** et **Mr. BAZ ABDENNBI** ont pris le départ le 18 avril dès les premières heures du matin pour affronter ce challenge extrême sur plus de 120 km à travers la montagne. Un engagement physique et mental hors du commun, qui témoigne de la passion et de la persévérance qui caractérisent les membres du club MAJOR.

Leur participation à cette distance est un exemple de dépassement de soi pour tous les adhérents du club. Bravo à eux !

---

## 👟 Les autres adhérents MAJOR sur les différentes distances

Le club était également représenté sur les distances intermédiaires, avec plusieurs adhérents ayant participé sur les formats :

- **HAUT 21** — 21 km
- **HAUT 42** — 45 km
- **HAUT 60** — 60 km

Chaque participant a relevé son propre défi, dans la bonne humeur et l'esprit d'équipe qui font la marque du Club MAJOR. Le départ groupé depuis El Jadida, le bus, les encouragements mutuels… tout cela forge une cohésion unique.

---

## 📸 L'esprit MAJOR au rendez-vous

Avant même le coup de départ, la photo de groupe avec la bannière MAJOR a affiché la couleur : **on est là, on est ensemble, et on est fiers de représenter Mazagan**.

Le Haut Atlas Ultra-Trail, c'est bien plus qu'une course. C'est une aventure collective, une découverte de paysages époustouflants, et une occasion de se dépasser en famille sportive.

---

## 💬 Un mot du club

> "Le Club MAJOR est une association à but non lucratif fondée sur des valeurs simples : le partage, l'effort, et la progression collective. Que vous couriez 10 km ou 120 km, vous êtes MAJOR."

---

## 🔗 En savoir plus sur l'événement

Pour plus d'informations sur le HAUT Ultra-Trail : [hautmorocco.com](https://hautmorocco.com/haut-2025/)

Rendez-vous sur notre page pour suivre nos prochains événements et rejoindre l'aventure !
`.trim()

  const post = await (prisma.blogPost as any).create({
    data: {
      title:      'HAUT 2026 — L\'équipe MAJOR conquiert le Haut Atlas Ultra-Trail',
      slug:       'haut-2026-equipe-major-ultra-trail-' + Date.now().toString(36),
      excerpt:    'Les 18 et 19 avril 2026, le Club MAJOR était présent au SONASID HIGH ATLAS ULTRA-TRAIL® avec nos deux vétérans BOULGHAIT Mohammed et BAZ ABDENNBI sur le Grand Challenge 120 km, ainsi que plusieurs adhérents sur les distances intermédiaires.',
      content,
      categoryId: category.id,
      tags:       ['Trail', 'Haut Atlas', 'Ultra-Trail', 'HAUT 2026', 'Compétition', 'MAJOR'],
      readTime:   5,
      published:  true,
      publishedAt: new Date('2026-04-18'),
    },
  })

  console.log('✓ Article créé :', post.title)
  console.log('  Slug :', post.slug)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
