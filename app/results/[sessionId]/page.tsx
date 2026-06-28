import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────

interface QuestionScore {
  id: string
  d1Linguistic: number
  d2ContentKnowledge: number
  d3CriticalThinking: number
  d4InquirySoph: number
  d5ContextIntegration: number
  composite: number
  feedback: string
}

interface SubmittedQuestion {
  id: string
  questionText: string
  ordinal: number
  score: QuestionScore | null
}

interface Scenario {
  id: string
  domain: 'MATH' | 'ELA' | 'SCIENCE'
  title: string
}

interface SessionItem {
  id: string
  ordinal: number
  scenario: Scenario
  questions: SubmittedQuestion[]
}

interface TestSession {
  id: string
  startedAt: string
  completedAt: string | null
  abilityEstimate: number | null
  status: string
  items: SessionItem[]
}

interface ResultsPayload {
  session: TestSession
  averageByDimension: { d1: number; d2: number; d3: number; d4: number; d5: number }
  averageByDomain: Record<string, { averageComposite: number; scenariosCompleted: number }>
  overallComposite: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

function thetaToLabel(theta: number | null): string {
  if (theta === null) return 'Not Scored'
  if (theta < -1.5) return 'Developing'
  if (theta < -0.5) return 'Approaching Proficiency'
  if (theta < 0.5) return 'Proficient'
  if (theta < 1.5) return 'Advanced'
  return 'Distinguished'
}

function thetaToColor(theta: number | null): string {
  if (theta === null) return 'text-slate-400'
  if (theta < -1.5) return 'text-red-400'
  if (theta < -0.5) return 'text-orange-400'
  if (theta < 0.5) return 'text-yellow-400'
  if (theta < 1.5) return 'text-emerald-400'
  return 'text-violet-400'
}

function scoreBarWidth(score: number, max = 5): string {
  return `${Math.round((score / max) * 100)}%`
}

const DOMAIN_ICONS: Record<string, string> = {
  MATH: '∑',
  ELA: '✎',
  SCIENCE: '⚗',
}

const DOMAIN_LABELS: Record<string, string> = {
  MATH: 'Mathematics',
  ELA: 'English Language Arts',
  SCIENCE: 'Science',
}

const DIMENSIONS = [
  { key: 'd1' as const, label: 'D1 Linguistic Sophistication' },
  { key: 'd2' as const, label: 'D2 Content Knowledge' },
  { key: 'd3' as const, label: 'D3 Critical Thinking' },
  { key: 'd4' as const, label: 'D4 Inquiry Depth' },
  { key: 'd5' as const, label: 'D5 Reading Comprehension' },
]

// ── Sub-components ─────────────────────────────────────────────────────────

function DimensionBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-52 text-sm text-slate-300 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all"
          style={{ width: scoreBarWidth(score) }}
        />
      </div>
      <span className="w-10 text-right text-sm font-mono text-slate-400">
        {score.toFixed(1)}/5
      </span>
    </div>
  )
}

function ItemReview({ item }: { item: SessionItem }) {
  return (
    <details className="group border border-slate-800 rounded-lg overflow-hidden">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-slate-900 hover:bg-slate-800 transition-colors list-none">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">#{item.ordinal + 1}</span>
          <span className="text-sm font-semibold text-white">{item.scenario.title}</span>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            {DOMAIN_LABELS[item.scenario.domain] ?? item.scenario.domain}
          </span>
        </div>
        <span className="text-slate-500 text-xs group-open:rotate-180 transition-transform">▼</span>
      </summary>

      <div className="divide-y divide-slate-800">
        {item.questions.map((q) => (
          <div key={q.id} className="px-4 py-4 bg-slate-950">
            <p className="text-sm text-slate-200 mb-3 leading-relaxed">
              <span className="text-slate-500 font-mono text-xs mr-2">Q{q.ordinal + 1}</span>
              {q.questionText}
            </p>
            {q.score ? (
              <div className="ml-5 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-500">Composite score</span>
                  <span className="text-sm font-semibold text-violet-400">
                    {q.score.composite.toFixed(1)}/5
                  </span>
                </div>
                {q.score.feedback && (
                  <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-violet-800 pl-3">
                    {q.score.feedback}
                  </p>
                )}
              </div>
            ) : (
              <p className="ml-5 text-xs text-slate-600 italic">Not yet scored</p>
            )}
          </div>
        ))}
      </div>
    </details>
  )
}

// ── Data fetching ──────────────────────────────────────────────────────────

async function fetchResults(sessionId: string): Promise<ResultsPayload | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const res = await fetch(`${baseUrl}/api/sessions/${sessionId}/results`, {
    cache: 'no-store',
  })

  if (!res.ok) return null
  return res.json() as Promise<ResultsPayload>
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const data = await fetchResults(sessionId)

  if (!data || data.session.status !== 'COMPLETED') {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="text-4xl mb-2">📋</div>
          <h1 className="text-2xl font-bold">Results Not Available</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {!data
              ? 'This session could not be found. It may have been deleted or the link is incorrect.'
              : 'This assessment session is still in progress. Results will appear here once it is completed.'}
          </p>
          <Link
            href="/"
            className="inline-block mt-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Return Home
          </Link>
        </div>
      </main>
    )
  }

  const { session, averageByDimension, averageByDomain, overallComposite } = data
  const theta = session.abilityEstimate
  const sessionDate = session.completedAt
    ? new Date(session.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(session.startedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* ── Header ── */}
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">
            Inquire Assessment
          </span>
          <h1 className="text-4xl font-bold tracking-tight">Your Inquire Results</h1>
          <p className="text-slate-500 text-sm">{sessionDate}</p>
        </div>

        {/* ── Overall level card ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Overall Performance Level</p>
          <p className={`text-5xl font-bold ${thetaToColor(theta)}`}>
            {thetaToLabel(theta)}
          </p>
          {theta !== null && (
            <p className="text-slate-500 text-xs font-mono">
              Ability estimate θ = {theta.toFixed(2)} &nbsp;|&nbsp; Overall composite{' '}
              {overallComposite.toFixed(2)}/5
            </p>
          )}
        </div>

        {/* ── Dimension bars ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white mb-4">Dimension Summary</h2>
          {DIMENSIONS.map(({ key, label }) => (
            <DimensionBar key={key} label={label} score={averageByDimension[key]} />
          ))}
        </div>

        {/* ── Domain breakdown ── */}
        {Object.keys(averageByDomain).length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Domain Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(averageByDomain).map(([domain, stats]) => (
                <div
                  key={domain}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-center space-y-1"
                >
                  <div className="text-2xl text-slate-400">
                    {DOMAIN_ICONS[domain] ?? '●'}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {DOMAIN_LABELS[domain] ?? domain}
                  </div>
                  <div className="text-2xl font-bold text-violet-400">
                    {stats.averageComposite.toFixed(1)}
                    <span className="text-base font-normal text-slate-500">/5</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {stats.scenariosCompleted}{' '}
                    {stats.scenariosCompleted === 1 ? 'scenario' : 'scenarios'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Item-by-item review ── */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-white">Question Review</h2>
          {session.items.length === 0 ? (
            <p className="text-slate-500 text-sm">No items recorded for this session.</p>
          ) : (
            session.items.map((item) => <ItemReview key={item.id} item={item} />)
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="border-t border-slate-800 pt-8 space-y-4 text-center">
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            This assessment was scored by Inquire AI. Scores reflect the depth and sophistication of
            your questions, not the correctness of any answers.
          </p>
          <Link
            href="/"
            className="inline-block text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
          >
            ← Return to Home
          </Link>
        </footer>

      </div>
    </main>
  )
}
