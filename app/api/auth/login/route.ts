import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const therapist = await prisma.therapists.findUnique({
      where: { email }
    })

    if (!therapist) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const validPassword = await bcrypt.compare(password, therapist.password_hash)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { 
        id: therapist.id,
        email: therapist.email,
        role: therapist.role,
        first_name: therapist.first_name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    )
        
    const response = NextResponse.json({ token })

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}