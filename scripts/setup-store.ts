import { requireEnv } from './_env'
// Store MAJOR — crée les tables du Store et le catalogue des articles.
//
// Usage :
//   npx tsx scripts/setup-store.ts          → base locale (DATABASE_URL)
//   npx tsx scripts/setup-store.ts --prod   → base de production Neon (PROD_DATABASE_URL)
//
// Idempotent : on peut le relancer sans risque. Les articles existants sont mis
// à jour (textes, photos, tailles) SANS toucher au prix ni à l'activation, qui
// se gèrent depuis l'admin (Store → Articles).
//
// Prérequis : `npx prisma generate` après la mise à jour de schema.prisma.

import { PrismaClient } from '@prisma/client'

const isProd = process.argv.includes('--prod')
const url    = isProd ? requireEnv('PROD_DATABASE_URL') : requireEnv('DATABASE_URL')
const db     = new PrismaClient({ datasourceUrl: url })

const TEXTILE = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const PRODUCTS = [
  {
    slug: 'tshirt-running', category: 'TEXTILE', sortOrder: 10,
    name: 'T-shirt running MAJOR', nameAr: 'قميص الجري ماجور',
    description: "Le maillot officiel du club. Devant : MAJOR, drapeau du Maroc et matricule A-55. Dos : la tête de cheval MAZAGAN et notre cri de ralliement « ماجووور بالفرح والسرور ».",
    descriptionAr: 'القميص الرسمي للنادي. في الأمام: ماجور وعلم المغرب ورقم A-55. في الخلف: رأس الحصان مزكان وشعارنا «ماجووور بالفرح والسرور».',
    features: ['Tissu technique respirant, micro-perforé', 'Séchage rapide', 'Impression sublimée : ne craquelle pas au lavage', 'Coupe unisexe, manches courtes'],
    featuresAr: ['قماش تقني يسمح بالتهوية', 'سريع الجفاف', 'طباعة بالتسامي لا تتشقق مع الغسل', 'قصة للجنسين بأكمام قصيرة'],
    sizes: TEXTILE, image: '/store/tshirt-front.jpg', imageBack: '/store/tshirt-back.jpg',
  },
  {
    slug: 'debardeur-homme', category: 'TEXTILE', sortOrder: 20,
    name: 'Débardeur running homme', nameAr: 'قميص بدون أكمام للرجال',
    description: "Le débardeur des jours chauds et des courses. Même design que le maillot officiel : MAJOR devant, cheval MAZAGAN au dos.",
    descriptionAr: 'قميص بدون أكمام للأيام الحارة والسباقات، بنفس تصميم القميص الرسمي: ماجور في الأمام وحصان مزكان في الخلف.',
    features: ['Emmanchures larges : liberté de mouvement', 'Tissu léger et respirant', 'Séchage rapide', 'Impression sublimée'],
    featuresAr: ['فتحات واسعة لحرية الحركة', 'قماش خفيف يسمح بالتهوية', 'سريع الجفاف', 'طباعة بالتسامي'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: '/store/debardeur-homme-front.jpg', imageBack: '/store/debardeur-homme-back.jpg',
  },
  {
    slug: 'debardeur-femme', category: 'TEXTILE', sortOrder: 30,
    name: 'Débardeur femme « Girl Power »', nameAr: 'قميص نسائي «Girl Power»',
    description: "Coupe cintrée et dos nageur pour les MAJORelles. Au dos : cheval MAZAGAN et l'inscription « Girl Power ».",
    descriptionAr: 'قصة مضبوطة وظهر رياضي لعدّاءات ماجور. في الخلف: حصان مزكان وعبارة «Girl Power».',
    features: ['Coupe ajustée féminine', 'Dos nageur : épaules libres', 'Tissu léger et respirant', 'Séchage rapide'],
    featuresAr: ['قصة نسائية مضبوطة', 'ظهر رياضي يحرر الكتفين', 'قماش خفيف يسمح بالتهوية', 'سريع الجفاف'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'], image: '/store/debardeur-femme-front.jpg', imageBack: '/store/debardeur-femme-back.jpg',
  },
  {
    slug: 'tunique-manches-longues', category: 'TEXTILE', sortOrder: 40,
    name: 'Tunique sport manches longues', nameAr: 'تونيك رياضي بأكمام طويلة',
    description: "Coupe longue et couvrante, manches longues : pour courir à l'aise en toute pudeur. Se porte seule ou avec le bonnet sport assorti.",
    descriptionAr: 'قصة طويلة ومحتشمة بأكمام طويلة للجري براحة تامة. تُلبس وحدها أو مع القبعة الرياضية المتناسقة.',
    features: ['Longueur couvrante (hanches)', 'Manches longues', 'Tissu technique respirant', 'Assortie au bonnet sport'],
    featuresAr: ['طول يغطي الوركين', 'أكمام طويلة', 'قماش تقني يسمح بالتهوية', 'متناسقة مع القبعة الرياضية'],
    sizes: TEXTILE, image: '/store/tunique.jpg', imageBack: null,
  },
  {
    slug: 'bonnet-sport', category: 'TEXTILE', sortOrder: 50,
    name: 'Bonnet sport couvre-cheveux', nameAr: 'قبعة رياضية تغطي الشعر',
    description: "Bonnet de course qui couvre les cheveux et la nuque, assorti à la tunique. Logo MAJOR et cheval « ماجور ».",
    descriptionAr: 'قبعة للجري تغطي الشعر والرقبة، متناسقة مع التونيك. شعار ماجور وحصان «ماجور».',
    features: ['Couvre cheveux et nuque', 'Tissu extensible et respirant', 'Maintien sans serrer', 'Assorti à la tunique'],
    featuresAr: ['يغطي الشعر والرقبة', 'قماش مطاطي يسمح بالتهوية', 'ثبات دون ضغط', 'متناسق مع التونيك'],
    sizes: [], image: '/store/bonnet.jpg', imageBack: null,
  },
  {
    slug: 'casquette', category: 'ACCESSOIRE', sortOrder: 60,
    name: 'Casquette running', nameAr: 'كاسكيت الجري',
    description: 'Casquette légère avec panneaux en maille aérée et liseré vert. Logo MAJOR brodé sur le devant.',
    descriptionAr: 'كاسكيت خفيفة بألواح شبكية للتهوية وحافة خضراء. شعار ماجور في الأمام.',
    features: ['Ultra légère', 'Côtés en maille aérée', 'Protège du soleil', 'Taille réglable'],
    featuresAr: ['خفيفة جدا', 'جوانب شبكية للتهوية', 'تحمي من الشمس', 'مقاس قابل للتعديل'],
    sizes: [], image: '/store/casquette.jpg', imageBack: null,
  },
  {
    slug: 'lunettes', category: 'ACCESSOIRE', sortOrder: 70,
    name: 'Lunettes de sport', nameAr: 'نظارات رياضية',
    description: 'Lunettes panoramiques à verres teintés verts, monture noire et verte, MAJOR sur la branche.',
    descriptionAr: 'نظارات بانورامية بعدسات خضراء ملونة وإطار أسود وأخضر، واسم ماجور على الذراع.',
    features: ['Verres panoramiques teintés', 'Monture légère', 'Bon maintien en course', 'Logo MAJOR sur la branche'],
    featuresAr: ['عدسات بانورامية ملونة', 'إطار خفيف', 'ثبات جيد أثناء الجري', 'شعار ماجور على الذراع'],
    sizes: [], image: '/store/lunettes.jpg', imageBack: null,
  },
  {
    slug: 'manchettes', category: 'ACCESSOIRE', sortOrder: 80,
    name: 'Manchettes de bras (la paire)', nameAr: 'أكمام الذراعين (زوج)',
    description: 'Manchettes de compression aux couleurs du club : protègent du soleil et du frais du matin, se retirent en courant.',
    descriptionAr: 'أكمام ضاغطة بألوان النادي تحمي من الشمس وبرد الصباح، وتُنزع بسهولة أثناء الجري.',
    features: ['Protection soleil et fraîcheur', 'Tissu respirant et extensible', 'Se retirent sans s\'arrêter', 'Vendues par paire'],
    featuresAr: ['حماية من الشمس والبرد', 'قماش مطاطي يسمح بالتهوية', 'تُنزع دون توقف', 'تباع بالزوج'],
    sizes: ['S/M', 'L/XL'], image: '/store/manchettes.jpg', imageBack: null,
  },
  {
    slug: 'chaussettes', category: 'ACCESSOIRE', sortOrder: 90,
    name: 'Chaussettes running (la paire)', nameAr: 'جوارب الجري (زوج)',
    description: 'Chaussettes mi-hautes à rayures vertes, talon et pointe renforcés, MAJOR et cheval sur la tige.',
    descriptionAr: 'جوارب متوسطة الطول بخطوط خضراء، كعب ومقدمة مقوّاة، واسم ماجور والحصان.',
    features: ['Talon et pointe renforcés', 'Maintien de la voûte plantaire', 'Confort sur la durée', 'Vendues par paire'],
    featuresAr: ['كعب ومقدمة مقوّاة', 'دعم لقوس القدم', 'راحة طوال المسافة', 'تباع بالزوج'],
    sizes: ['39-42', '43-46'], image: '/store/chaussettes.jpg', imageBack: null,
  },
  {
    slug: 'bracelets', category: 'ACCESSOIRE', sortOrder: 100,
    name: 'Bracelets éponge (la paire)', nameAr: 'أساور إسفنجية (زوج)',
    description: "Bracelets éponge pour essuyer la sueur : l'un marqué MAJOR, l'autre à l'étoile verte du drapeau.",
    descriptionAr: 'أساور إسفنجية لمسح العرق: واحدة باسم ماجور والأخرى بالنجمة الخضراء.',
    features: ['Éponge absorbante', 'Élastiques et confortables', 'Lavables en machine', 'Vendus par paire'],
    featuresAr: ['إسفنج ماص', 'مطاطية ومريحة', 'قابلة للغسل في الآلة', 'تباع بالزوج'],
    sizes: [], image: '/store/bracelets.jpg', imageBack: null,
  },
  {
    slug: 'ceinture-running', category: 'ACCESSOIRE', sortOrder: 110,
    name: 'Ceinture running', nameAr: 'حزام الجري',
    description: 'Ceinture porte-objets pour téléphone, clés et gels. Fermetures éclair, sangle réglable, logo MAJOR.',
    descriptionAr: 'حزام لحمل الهاتف والمفاتيح والجل، بسحابات وحزام قابل للتعديل وشعار ماجور.',
    features: ['Poche zippée pour téléphone et clés', 'Sangle élastique réglable', 'Ne rebondit pas en courant', 'Légère'],
    featuresAr: ['جيب بسحاب للهاتف والمفاتيح', 'حزام مطاطي قابل للتعديل', 'لا يتحرك أثناء الجري', 'خفيف'],
    sizes: [], image: '/store/ceinture.jpg', imageBack: null,
  },
  {
    slug: 'soft-flask', category: 'ACCESSOIRE', sortOrder: 120,
    name: 'Soft-flask 500 ml', nameAr: 'قارورة مرنة 500 مل',
    description: 'Gourde souple qui se plie une fois vide. Design MAZAGAN « More than a run », mousqueton pour l\'accrocher au sac.',
    descriptionAr: 'قارورة مرنة تُطوى بعد إفراغها، بتصميم مزكان «More than a run» ومشبك لتعليقها في الحقيبة.',
    features: ['Ultra légère, pliable', 'Sans BPA', 'Bouchon sport anti-fuite', 'Mousqueton aluminium'],
    featuresAr: ['خفيفة جدا وقابلة للطي', 'خالية من BPA', 'غطاء رياضي مانع للتسرب', 'مشبك من الألمنيوم'],
    sizes: [], image: '/store/softflask.jpg', imageBack: null,
  },
  {
    slug: 'serviette-running', category: 'ACCESSOIRE', sortOrder: 130,
    name: 'Serviette running', nameAr: 'منشفة الجري',
    description: "Serviette absorbante aux couleurs du club, à glisser dans le sac pour l'après-séance.",
    descriptionAr: 'منشفة ماصة بألوان النادي، تُوضع في الحقيبة لما بعد الحصة.',
    features: ['Très absorbante', 'Séchage rapide', 'Compacte dans le sac', 'Liseré vert et logo MAJOR'],
    featuresAr: ['ماصة جدا', 'سريعة الجفاف', 'صغيرة في الحقيبة', 'حافة خضراء وشعار ماجور'],
    sizes: [], image: '/store/serviette.jpg', imageBack: null,
  },
]

const SQL = [
  `DO $$ BEGIN
     CREATE TYPE "StoreOrderStatus" AS ENUM ('NEW','CONFIRMED','PAID','DELIVERED','CANCELLED');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `CREATE TABLE IF NOT EXISTS "store_products" (
     "id"            TEXT             PRIMARY KEY,
     "slug"          TEXT             NOT NULL,
     "category"      TEXT             NOT NULL,
     "name"          TEXT             NOT NULL,
     "nameAr"        TEXT,
     "description"   TEXT             NOT NULL,
     "descriptionAr" TEXT,
     "features"      TEXT[]           NOT NULL DEFAULT ARRAY[]::TEXT[],
     "featuresAr"    TEXT[]           NOT NULL DEFAULT ARRAY[]::TEXT[],
     "sizes"         TEXT[]           NOT NULL DEFAULT ARRAY[]::TEXT[],
     "price"         DOUBLE PRECISION,
     "image"         TEXT             NOT NULL,
     "imageBack"     TEXT,
     "active"        BOOLEAN          NOT NULL DEFAULT true,
     "sortOrder"     INTEGER          NOT NULL DEFAULT 0,
     "createdAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt"     TIMESTAMP(3)     NOT NULL
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "store_products_slug_key" ON "store_products"("slug")`,
  `CREATE TABLE IF NOT EXISTS "store_orders" (
     "id"         TEXT               PRIMARY KEY,
     "reference"  TEXT               NOT NULL,
     "memberId"   TEXT               NOT NULL,
     "status"     "StoreOrderStatus" NOT NULL DEFAULT 'NEW',
     "total"      DOUBLE PRECISION   NOT NULL,
     "note"       TEXT,
     "adminNote"  TEXT,
     "createdAt"  TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt"  TIMESTAMP(3)       NOT NULL
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "store_orders_reference_key" ON "store_orders"("reference")`,
  `CREATE INDEX IF NOT EXISTS "store_orders_status_idx"   ON "store_orders"("status")`,
  `CREATE INDEX IF NOT EXISTS "store_orders_memberId_idx" ON "store_orders"("memberId")`,
  `CREATE TABLE IF NOT EXISTS "store_order_items" (
     "id"          TEXT             PRIMARY KEY,
     "orderId"     TEXT             NOT NULL,
     "productId"   TEXT             NOT NULL,
     "productName" TEXT             NOT NULL,
     "size"        TEXT,
     "quantity"    INTEGER          NOT NULL,
     "unitPrice"   DOUBLE PRECISION NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS "store_order_items_orderId_idx"   ON "store_order_items"("orderId")`,
  `CREATE INDEX IF NOT EXISTS "store_order_items_productId_idx" ON "store_order_items"("productId")`,
  `DO $$ BEGIN
     ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_memberId_fkey"
       FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
     ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_orderId_fkey"
       FOREIGN KEY ("orderId") REFERENCES "store_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
     ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_productId_fkey"
       FOREIGN KEY ("productId") REFERENCES "store_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,
]

async function main() {
  console.log(`🛍️  Store MAJOR — installation sur ${isProd ? 'PRODUCTION (Neon)' : 'LOCAL'}\n`)

  console.log('1) Tables et contraintes…')
  for (const q of SQL) await db.$executeRawUnsafe(q)
  console.log('   ✅ store_products, store_orders, store_order_items présentes')

  console.log('\n2) Catalogue des articles…')
  const store = (db as any).storeProduct
  for (const p of PRODUCTS) {
    const { slug, ...content } = p
    const existing = await store.findUnique({ where: { slug } })
    if (existing) {
      await store.update({ where: { slug }, data: content })   // prix et activation conservés
      console.log(`   ↻ ${p.name}`)
    } else {
      await store.create({ data: { slug, ...content } })
      console.log(`   ＋ ${p.name}`)
    }
  }
  const count = await store.count()
  const priced = await store.count({ where: { price: { not: null } } })
  console.log(`\n✅ Terminé — ${count} articles, dont ${priced} avec un prix.`)
  if (priced < count) console.log('   ➜ Saisis les prix dans Admin → Store → Articles.')
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(() => db.$disconnect())
