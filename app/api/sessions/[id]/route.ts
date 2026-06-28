import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await prisma.testSession.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          scenario: true,
          questions: { include: { score: true } },
        },
        orderBy: { ordinal: 'asc' },
      },
    },
  })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(session)
}
