import prisma from './db'

const seed = async () => {
  console.log('Seeding roles...')
  const roles = ['ADMIN', 'CREATOR', 'WORKER', 'MODERATOR']
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role as any },
      update: {},
      create: {
        name: role as any,
        description: `${role} role`,
      },
    })
  }
  console.log('✅ Roles seeded!')

  console.log('Seeding categories...')
  const categories = [
    { name: 'Plumbing', icon: '🔧' },
    { name: 'Electrical', icon: '⚡' },
    { name: 'Carpentry', icon: '🪚' },
    { name: 'Cleaning', icon: '🧹' },
    { name: 'Tutoring', icon: '📚' },
    { name: 'Delivery', icon: '🚚' },
    { name: 'IT Support', icon: '💻' },
    { name: 'Cooking', icon: '🍳' },
    { name: 'Driving', icon: '🚗' },
    { name: 'Gardening', icon: '🌿' },
    { name: 'Painting', icon: '🎨' },
    { name: 'Photography', icon: '📷' },
    { name: 'Security', icon: '🔒' },
    { name: 'Healthcare', icon: '🏥' },
    { name: 'Data Entry', icon: '📊' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
        icon: category.icon,
        isOfficial: true,
        status: 'ACTIVE',
      },
    })
  }
  console.log('✅ Categories seeded!')

  process.exit(0)
}

seed().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})