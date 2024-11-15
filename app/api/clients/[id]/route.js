import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const { id } = params
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

    const client = await prisma.clients.update({
      where: { id: parseInt(id) },
      data: data
    })
    
    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error updating client',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await prisma.clients.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error deleting client',
      details: error.message 
    }, { status: 500 })
  }
}