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

  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Collect all scores across all items and questions
  const allScores = session.items.flatMap((item) =>
    item.questions.flatMap((q) => (q.score ? [q.score] : []))
  )

  // Average by dimension
  const averageByDimension =
    allScores.length > 0
      ? {
          d1: allScores.reduce((s, r) => s + r.d1Linguistic, 0) / allScores.length,
          d2: allScores.reduce((s, r) => s + r.d2ContentKnowledge, 0) / allScores.length,
          d3: allScores.reduce((s, r) => s + r.d3CriticalThinking, 0) / allScores.length,
          d4: allScores.reduce((s, r) => s + r.d4InquirySoph, 0) / allScores.length,
          d5: allScores.reduce((s, r) => s + r.d5ContextIntegration, 0) / allScores.length,
        }
      : { d1: 0, d2: 0, d3: 0, d4: 0, d5: 0 }

  // Average composite per domain
  const domainMap: Record<string, { total: number; count: number; scenarios: Set<string> }> = {}
  for (const item of session.items) {
    const domain = item.scenario.domain
    if (!domainMap[domain]) {
      domainMap[domain] = { total: 0, count: 0, scenarios: new Set() }
    }
    domainMap[domain].scenarios.add(item.scenarioId)
    for (const q of item.questions) {
      if (q.score) {
        domainMap[domain].total += q.score.composite
        domainMap[domain].count += 1
      }
    }
  }

  const averageByDomain: Record<string, { averageComposite: number; scenariosCompleted: number }> =
    {}
  for (const [domain, data] of Object.entries(domainMap)) {
    averageByDomain[domain] = {
      averageComposite: data.count > 0 ? data.total / data.count : 0,
      scenariosCompleted: data.scenarios.size,
    }
  }

  const overallComposite =
    allScores.length > 0
      ? allScores.reduce((s, r) => s + r.composite, 0) / allScores.length
      : 0

  return NextResponse.json({
    session,
    averageByDimension,
    averageByDomain,
    overallComposite,
  })
}
