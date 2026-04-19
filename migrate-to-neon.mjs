import { PrismaClient } from '@prisma/client'
const L=new PrismaClient({datasources:{db:{url:'postgresql://postgres:Major@localhost:5432/clubmajor'}}})
const N=new PrismaClient({datasources:{db:{url:'postgresql://neondb_owner:npg_F4WBLe6rxZTm@ep-sweet-unit-amybnzup-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'}}})
async function main(){
  const c=await L.blogCategory.findMany()
  for(const x of c)await N.blogCategory.upsert({where:{slug:x.slug},update:x,create:x})
  console.log('cats:'+c.length)
  const p=await L.blogPost.findMany()
  for(const x of p)await N.blogPost.upsert({where:{slug:x.slug},update:x,create:x})
  console.log('posts:'+p.length)
  const e=await L.event.findMany()
  for(const x of e)await N.event.upsert({where:{slug:x.slug},update:x,create:x})
  console.log('events:'+e.length)
  const r=await L.trainingProgram.findMany({include:{sessions:true}})
  for(const x of r){
    const{sessions:s,...d}=x
    const cr=await N.trainingProgram.upsert({where:{month_year:{month:d.month,year:d.year}},update:d,create:d})
    for(const ss of s){const{programId:_,...sd}=ss;await N.trainingProgramSession.upsert({where:{id:ss.id},update:sd,create:{...sd,programId:cr.id}})}
  }
  console.log('progs:'+r.length)
  console.log('DONE!')
}
main().catch(e=>{console.error('ERROR:',e.message);process.exit(1)}).finally(async()=>{await L.$disconnect();await N.$disconnect()})
