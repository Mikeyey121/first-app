import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

interface TherapistInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 10)
  await prisma.therapists.create({
    data: {
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@therapy.com',
      password_hash: adminHash,
      role: 'ADMIN'
    }
  })

  // Create some therapists
  const therapists: TherapistInput[] = [
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@therapy.com',
      password: 'therapist123'
    },
    {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.c@therapy.com',
      password: 'therapist123'
    },
    {
      firstName: 'Emily',
      lastName: 'Williams',
      email: 'emily.w@therapy.com',
      password: 'therapist123'
    }
  ]

  for (const therapist of therapists) {
    const hash = await bcrypt.hash(therapist.password, 10)
    await prisma.therapists.create({
      data: {
        first_name: therapist.firstName,
        last_name: therapist.lastName,
        email: therapist.email,
        password_hash: hash,
        role: 'THERAPIST'
      }
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })