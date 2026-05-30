import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })

export const PORT = Number(process.env.PORT) || 3001
export const SYMPLA_TOKEN = process.env.SYMPLA_TOKEN || process.env.VITE_SYMPLA_TOKEN || ''
export const SYMPLA_BASE = 'https://api.sympla.com.br'
