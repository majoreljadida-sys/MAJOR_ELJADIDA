import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
function getAllFiles(dir) {
  const files = []
  for (const f of readdirSync(dir)) {
    const full = join(dir, f)
    if (statSync(full).isDirectory() && f !== 'node_modules' && f !== '.next') files.push(...getAllFiles(full))
    else if (f === 'route.ts') files.push(full)
  }
  return files
}
const files = getAllFiles('./app/api')
let count = 0
for (const file of files) {
  let c = readFileSync(file, 'utf8')
  const orig = c
  c = c.replaceAll("session.user.role !== 'ADMIN'","session.user.role?.toLowerCase() !== 'admin'")
       .replaceAll("session.user.role !== 'COACH'","session.user.role?.toLowerCase() !== 'coach'")
       .replaceAll("session.user.role !== 'MEMBER'","session.user.role?.toLowerCase() !== 'member'")
       .replaceAll("session.user.role === 'ADMIN'","session.user.role?.toLowerCase() === 'admin'")
       .replaceAll("session.user.role === 'COACH'","session.user.role?.toLowerCase() === 'coach'")
       .replaceAll("session.user.role === 'MEMBER'","session.user.role?.toLowerCase() === 'member'")
  if (c !== orig) { writeFileSync(file, c, 'utf8'); console.log('OK: ' + file); count++ }
}
console.log('Total: ' + count + ' fichiers')
