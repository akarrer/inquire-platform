import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const user = await prisma.user.upsert({
      where: { email: 'demo@inquire.dev' },
      update: {},
      create: { email: 'demo@inquire.dev', name: 'Demo Student', role: 'STUDENT' },
    })

    const session = await prisma.testSession.create({
      data: { userId: user.id, status: 'IN_PROGRESS' },
    })

    return NextResponse.json(session)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
