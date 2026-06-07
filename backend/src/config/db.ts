import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const pool = new PrismaMariaDb({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Anilaz@55',
  database: 'atdoor',
  connectionLimit: 5,
  idleTimeout: 60000,
  acquireTimeout: 60000,
})

const prisma = new PrismaClient({ adapter: pool })

// Keep connection alive
prisma.$connect().then(() => {
  console.log('✅ Database connected!')
}).catch((err) => {
  console.error('❌ Database connection failed:', err)
})

export default prisma