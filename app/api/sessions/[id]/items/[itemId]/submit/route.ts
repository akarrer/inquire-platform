import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scoreQuestion } from '@/lib/claude'
import type { Domain, ContextLevel } from '@/lib/types'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params
  const { questions, timeOnTask } = (await req.json()) as {
    questions: string[]
    timeOnTask: number
  }

  const item = await prisma.sessionItem.findUnique({
    where: { id: itemId },
    include: { scenario: true },
  })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.sessionItem.update({
    where: { id: itemId },
    data: { submittedAt: new Date(), timeOnTask },
  })

  const scores = await Promise.all(
    questions.map(async (q, i) => {
      const submitted = await prisma.submittedQuestion.create({
        data: { sessionItemId: itemId, questionText: q, ordinal: i },
      })

      const result = await scoreQuestion(
        item.scenario.domain as Domain,
        item.scenario.contextLevel as ContextLevel,
        item.scenario.scenarioText,
        item.scenario.contextText ?? undefined,
        q
      )

      const saved = await prisma.questionScore.create({
        data: {
          questionId: submitted.id,
          d1Linguistic: result.d1Linguistic.score,
          d2ContentKnowledge: result.d2ContentKnowledge.score,
          d3CriticalThinking: result.d3CriticalThinking.score,
          d4InquirySoph: result.d4InquirySoph.score,
          d5ContextIntegration: result.d5ContextIntegration.score,
          composite: result.composite,
          feedback: result.feedback,
          linguisticRationale: result.d1Linguistic.rationale,
          contentRationale: result.d2ContentKnowledge.rationale,
          thinkingRationale: result.d3CriticalThinking.rationale,
          inquiryRationale: result.d4InquirySoph.rationale,
          contextRationale: result.d5ContextIntegration.rationale,
          rawResponse: result as object,
        },
      })

      return { ...saved, details: result }
    })
  )

  // Update session ability estimate (composite 1-5 mapped to theta -2..+2)
  const meanComposite = scores.reduce((s, r) => s + r.composite, 0) / scores.length
  const newTheta = (meanComposite - 3)
  await prisma.testSession.update({
    where: { id },
    data: { abilityEstimate: newTheta },
  })

  return NextResponse.json({ scores })
}
