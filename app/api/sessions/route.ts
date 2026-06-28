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
    const url = process.env.DATABASE_URL ?? 'NOT_SET'
    const urlHost = (() => { try { return new URL(url).hostname } catch { return 'PARSE_FAIL:' + url.slice(0, 40) } })()
    return NextResponse.json({ error: msg, dbHost: urlHost }, { status: 500 })
  }
}
