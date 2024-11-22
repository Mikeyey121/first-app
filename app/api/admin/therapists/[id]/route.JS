import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import jwt from 'jsonwebtoken'

// Helper function to verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
  } catch {
    return null
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = params
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (decoded.id === parseInt(id)) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    await prisma.therapists.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request, context) {
  try {
    const id = await context.params.id
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updateData = await request.json()
    
    const therapist = await prisma.therapists.update({
      where: { id: parseInt(id) },
      data: {
        first_name: updateData.first_name,
        last_name: updateData.last_name,
        email: updateData.email,
        role: updateData.role
      }
    })

    return NextResponse.json(therapist)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}