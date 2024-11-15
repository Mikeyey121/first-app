import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const verifyToken = (token) => {
  if (typeof token !== 'string') {
    console.error('Token must be a string, received:', typeof token)
    return null
  }

  try {
    console.log('Verifying token...')
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token.trim(), secret)
    console.log('Token verified successfully')
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization')
    console.log('Auth header received:', authHeader)

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No Bearer token found in header')
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      console.log('Token extraction failed')
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    console.log('Token extracted from header:', token.substring(0, 10) + '...')

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    console.log('Fetching clients for user:', decoded.id, 'role:', decoded.role)

    const clients = await prisma.clients.findMany({
      where: {
        status: 'active',
        ...(decoded.role !== 'ADMIN' ? { therapist_id: decoded.id } : {})
      }
    })
    
    return NextResponse.json(clients)
  } catch (error) {
    console.error('GET Error details:', error)
    return NextResponse.json({ 
      error: 'Error fetching clients',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const client = await prisma.clients.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        therapist_id: decoded.id,
        status: 'active'
      },
    })
    
    return NextResponse.json(client)
  } catch (error) {
    console.error('POST Error details:', error)
    return NextResponse.json({ 
      error: 'Error creating client',
      details: error.message 
    }, { status: 500 })
  }
}