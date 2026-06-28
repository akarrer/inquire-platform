import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await req.json()
  const session = await prisma.testSession.create({
    data: { userId, status: 'IN_PROGRESS' },
  })
  return NextResponse.json(session)
}
