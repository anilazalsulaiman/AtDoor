import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import categoryRoutes from './routes/category.routes'
import jobRoutes from './routes/job.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'AtDoor API is running!',
    version: '1.0.0'
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/jobs', jobRoutes)

// Start server
app.listen(PORT, () => {
  console.log(`AtDoor server running on port ${PORT}`)
})

export default app