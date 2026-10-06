import dotenv from 'dotenv'

dotenv.config({ path: new URL('../.env', import.meta.url) })

const { default: app } = await import('./app.js')
const port = Number.parseInt(process.env.PORT || '4000', 10)

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`)
}

const server = app.listen(port, () => {
  console.log(`NEXORA backend running on http://localhost:${port}`)
})

server.on('error', (error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
