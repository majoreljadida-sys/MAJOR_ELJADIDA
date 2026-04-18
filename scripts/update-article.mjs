import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const content = `# Courir régulièrement : le meilleur remède que votre médecin n'a pas encore prescrit

> *"La meilleure thérapie coûte une paire de chaussures."* — L'esprit Club MAJOR

## Ce que la science dit (et ce que les coureurs savent depuis longtemps)

La recherche médicale est sans équivoque : pratiquer la course à pied régulièrement — même à faible intensité — réduit significativement le risque de développer les maladies les plus coûteuses en soins médicaux.

---

## 1. Cœur et tension artérielle

- **-45%** de risque de maladies cardiovasculaires chez les coureurs réguliers *(American College of Cardiology, 2014)*
- **-30%** de risque de mortalité par maladie cardiaque avec seulement 5 à 10 minutes de course par jour à allure lente
- La tension artérielle baisse en moyenne de **4 à 9 mmHg** après 3 mois de pratique régulière

> Un coureur de 40 ans qui court 3 fois par semaine a un cœur biologiquement plus jeune de 10 ans que son sédentaire voisin.

---

## 2. Diabète de type 2 et métabolisme

- **-50%** de risque de diabète de type 2 pour les coureurs réguliers *(étude Harvard, 2011)*
- **20 minutes de footing** à intensité modérée suffisent à améliorer la glycémie post-repas
- Effet durable : les bénéfices métaboliques persistent plusieurs jours après une séance

Pour les personnes déjà diabétiques, la marche rapide et le jogging font partie des traitements recommandés par l'OMS au même titre que certains médicaments.

---

## 3. Santé mentale : l'antidépresseur naturel

- La course libère des **endorphines, dopamine et sérotonine** — les mêmes neurotransmetteurs ciblés par les antidépresseurs
- **-30%** de symptômes dépressifs après 8 semaines de pratique *(méta-analyse JAMA, 2023)*
- Réduction mesurable de l'anxiété après **une seule séance de 20 minutes**

> "Je dors mieux, je stress moins, et j'ai arrêté deux médicaments en accord avec mon médecin depuis que je cours avec MAJOR." — *Témoignage d'un membre du club*

---

## 4. Système immunitaire

- Une pratique modérée augmente l'activité des cellules NK (Natural Killer) — la première ligne de défense immunitaire
- Les coureurs modérés font **43% moins de maladies respiratoires** que les sédentaires *(BJSM, 2011)*
- L'inflammation chronique — à la base de nombreuses maladies modernes — est **réduite** par la pratique régulière

---

## 5. Os, articulations et prévention des douleurs chroniques

Contrairement à une idée reçue, courir **renforce** les articulations plutôt que de les user.

- La densité osseuse augmente : **-40%** de risque d'ostéoporose
- Le cartilage du genou est **mieux nourri** chez les coureurs que chez les sédentaires *(Stanford University, 2017)*
- Les lombalgies chroniques sont réduites grâce au renforcement des muscles du dos et du core

> Le running ne détruit pas vos genoux. Le surpoids, la sédentarité et la mauvaise posture, oui.

---

## 6. Espérance de vie : le chiffre qui parle

Une méta-analyse portant sur **230 000 personnes** *(British Journal of Sports Medicine)* a établi que :

- Les coureurs réguliers vivent en moyenne **3 ans de plus** que les non-coureurs
- Le gain d'espérance de vie est visible même avec **seulement 1 à 2 heures de course par semaine**
- Chaque heure de running "rapporte" environ **7 heures de vie supplémentaire**

---

## Ce que ça change concrètement pour votre santé et votre budget

| Problème évité | Économie estimée (soins / an) |
|---|---|
| Hypertension contrôlée | 300–800 Dhs |
| Diabète de type 2 prévenu | 2 000–5 000 Dhs |
| Dépression légère/modérée | 1 500–4 000 Dhs |
| Lombalgies réduites | 500–2 000 Dhs |
| Maladies respiratoires évitées | 400–1 200 Dhs |

Et ça, sans compter les gains en qualité de vie, en énergie quotidienne, et en confiance en soi.

---

## Alors, par où commencer ?

**30 minutes, 3 fois par semaine, à allure conversationnelle** suffisent pour déclencher la plupart de ces effets bénéfiques.

Au Club MAJOR, vous n'êtes pas seul. On court ensemble, on se motive, on rigole, on partage — et on finit la sortie avec un sourire qu'aucune ordonnance ne peut donner.

**Parce que la meilleure thérapie coûte une paire de chaussures. Et une bonne compagnie.**

---

*Sources : American College of Cardiology (2014), Harvard School of Public Health (2011), JAMA Psychiatry (2023), British Journal of Sports Medicine (2011, 2017), Stanford University (2017), OMS.*`

async function run() {
  await prisma.blogPost.update({
    where: { slug: 'bienfaits-course-pied-sante-medecin' },
    data: { content },
  })
  console.log('Article mis à jour avec le contenu complet.')
}

run().finally(() => prisma.$disconnect())
