import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbFile = path.join(dataDir, 'db.json')
const defaultData = { users: [], projects: [] }

const adapter = new JSONFile(dbFile)
const db = new Low(adapter, defaultData)

await db.read()
await db.write()

export default db
