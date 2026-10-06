import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import health from './routes/health.js'
import profile from './routes/profile.js'
import game from './routes/game.js'
import mentor from './routes/mentor.js'
import leaderboard from './routes/leaderboard.js'
import { notFound, errorHandler } from './middleware/errors.js'

const app = express()
const origins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map(x => x.trim())
app.use(helmet())
app.use(cors({ origin: origins, credentials: false }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }))
app.get('/', (req, res) => res.json({ name: 'NEXORA API', version: '1.0.0', docs: '/api/health' }))
app.use('/api/health', health)
app.use('/api/profile', profile)
app.use('/api/game', game)
app.use('/api/mentor', mentor)
app.use('/api/leaderboard', leaderboard)
app.use(notFound)
app.use(errorHandler)
export default app
