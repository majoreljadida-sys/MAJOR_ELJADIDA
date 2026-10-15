// Charge le fichier .env à la racine du projet pour les scripts lancés avec tsx
// (sans dépendance externe). Les variables déjà définies ne sont pas écrasées.
// Variables attendues : DATABASE_URL (base locale) et PROD_DATABASE_URL (Neon).
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(__dirname, '..', '.env')
if (existsSync(envPath)) {
  for (const raw of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
    if (process.env[key] === undefined) process.env[key] = val
  }
}

export function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    console.error(`❌ Variable ${name} absente : ajoute-la dans le fichier .env`)
    process.exit(1)
  }
  return v
}
