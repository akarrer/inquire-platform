import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateScenario } from '@/lib/claude'
import type { Domain, ContextLevel } from '@/lib/types'

const DOMAINS: Domain[] = ['MATH', 'ELA', 'SCIENCE']
const CONTEXT_LEVELS: ContextLevel[] = ['SPARSE', 'PARTIAL', 'RICH']

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await prisma.testSession.findUnique({
    where: { id },
    include: { items: { include: { scenario: true } } },
  })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const itemCount = session.items.length
  const theta = session.abilityEstimate ?? 0
  const se = session.abilitySE ?? 1

  if (itemCount >= 20 || (itemCount >= 8 && se < 0.25)) {
    await prisma.testSession.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })
    return NextResponse.json({ complete: true })
  }

  // Balance domains — pick whichever has fewest items so far
  const usedDomains = session.items.map((item) => item.scenario.domain as Domain)
  const domainCounts = DOMAINS.reduce(
    (acc, d) => ({ ...acc, [d]: usedDomains.filter((x) => x === d).length }),
    {} as Record<Domain, number>
  )
  const domain = DOMAINS.reduce((a, b) => (domainCounts[a] <= domainCounts[b] ? a : b))

  // Adaptive context level based on ability estimate
  let contextLevel: ContextLevel
  if (theta > 1) contextLevel = 'RICH'
  else if (theta < -1) contextLevel = 'SPARSE'
  else contextLevel = CONTEXT_LEVELS[itemCount % 3]

  // Find an existing unused scenario first; generate one if none available
  let scenario = await prisma.scenario.findFirst({
    where: {
      domain,
      contextLevel,
      active: true,
      id: { notIn: session.items.map((item) => item.scenarioId) },
    },
  })

  if (!scenario) {
    const generated = await generateScenario(domain, contextLevel, theta)
    scenario = await prisma.scenario.create({
      data: { domain, contextLevel, difficulty: theta, tags: [], ...generated },
    })
  }

  const item = await prisma.sessionItem.create({
    data: { sessionId: id, scenarioId: scenario.id, ordinal: itemCount },
    include: { scenario: true },
  })

  return NextResponse.json(item)
}
