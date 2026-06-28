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

function thetaToColors(theta: number | null): { text: string; bg: string; border: string } {
  if (theta === null) return { text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' }
  if (theta < -1.5) return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  if (theta < -0.5) return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' }
  if (theta < 0.5) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
  if (theta < 1.5) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  return { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' }
}

function scoreBarWidth(score: number, max = 5): string {
  return `${Math.round((score / max) * 100)}%`
}

function scoreBarColor(score: number): string {
  if (score > 3.5) return 'bg-emerald-500'
  if (score >= 2.5) return 'bg-amber-400'
  return 'bg-red-400'
}

const DOMAIN_LABELS: Record<string, string> = {
  MATH: 'Mathematics',
  ELA: 'English Language Arts',
  SCIENCE: 'Science',
}

const DOMAIN_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  MATH: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ELA: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  SCIENCE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
}

const DIMENSIONS = [
  { key: 'd1' as const, label: 'Linguistic Sophistication', weight: '15%' },
  { key: 'd2' as const, label: 'Content Knowledge', weight: '30%' },
  { key: 'd3' as const, label: 'Critical Thinking', weight: '30%' },
  { key: 'd4' as const, label: 'Inquiry Depth', weight: '25%' },
  { key: 'd5' as const, label: 'Reading Comprehension', weight: '—' },
]

// ── Sub-components ─────────────────────────────────────────────────────────

function DimensionBar({ label, weight, score }: { label: string; weight: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-56 shrink-0">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 ml-1">({weight})</span>
      </div>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${scoreBarColor(score)}`}
          style={{ width: scoreBarWidth(score) }}
        />
      </div>
      <span className="w-12 text-right text-sm font-mono text-gray-600 tabular-nums">
        {score.toFixed(1)}<span className="text-gray-300">/5</span>
      </span>
    </div>
  )
}

function ItemReview({ item }: { item: SessionItem }) {
  const badge = DOMAIN_BADGE[item.scenario.domain] ?? { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
  return (
    <details className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-gray-50 transition-colors list-none">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono text-gray-400">#{item.ordinal + 1}</span>
          <span className="text-sm font-semibold text-gray-900">{item.scenario.title}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
            {DOMAIN_LABELS[item.scenario.domain] ?? item.scenario.domain}
          </span>
        </div>
        <svg
          className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      <div className="divide-y divide-gray-100 border-t border-gray-100">
        {item.questions.map((q) => (
          <div key={q.id} className="px-5 py-4 bg-gray-50">
            <p className="text-sm text-gray-800 mb-3 leading-relaxed">
              <span className="text-gray-400 font-mono text-xs mr-2">Q{q.ordinal + 1}</span>
              {q.questionText}
            </p>
            {q.score ? (
              <div className="ml-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Composite</span>
                  <span className="text-sm font-semibold text-indigo-600">
                    {q.score.composite.toFixed(1)}/5
                  </span>
                </div>
                {q.score.feedback && (
                  <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-indigo-200 pl-3">
                    {q.score.feedback}
                  </p>
                )}
              </div>
            ) : (
              <p className="ml-5 text-xs text-gray-400 italic">Not yet scored</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm max-w-md w-full p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Results Not Available</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {!data
              ? 'This session could not be found. The link may be incorrect or the session may have been removed.'
              : 'This assessment is still in progress. Results will appear here once it is completed.'}
          </p>
          <Link
            href="/"
            className="inline-block mt-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  const { session, averageByDimension, averageByDomain, overallComposite } = data
  const theta = session.abilityEstimate
  const levelColors = thetaToColors(theta)

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-700 rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 13H2L8 2Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">Inquire</span>
          </Link>
          <span className="text-xs text-gray-400 font-medium">Assessment Results</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* ── Report header ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Inquire Assessment Report</p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your Results</h1>
              <p className="text-gray-400 text-sm mt-1">{sessionDate}</p>
            </div>
            <div className={`text-center px-6 py-4 rounded-xl border-2 ${levelColors.bg} ${levelColors.border}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Performance Level</p>
              <p className={`text-2xl font-bold ${levelColors.text}`}>
                {thetaToLabel(theta)}
              </p>
              {theta !== null && (
                <p className="text-xs text-gray-400 font-mono mt-1">
                  θ = {theta.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Quick stat */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Overall Score</p>
              <p className="text-xl font-bold text-gray-900">
                {overallComposite.toFixed(2)}<span className="text-gray-400 font-normal text-sm">/5</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Scenarios</p>
              <p className="text-xl font-bold text-gray-900">{session.items.length}</p>
            </div>
          </div>
        </div>

        {/* ── Dimension breakdown ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Dimension Breakdown</h2>
          {DIMENSIONS.map(({ key, label, weight }) => (
            <DimensionBar key={key} label={label} weight={weight} score={averageByDimension[key]} />
          ))}
        </div>

        {/* ── Domain breakdown ── */}
        {Object.keys(averageByDomain).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-5">By Domain</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(averageByDomain).map(([domain, stats]) => {
                const badge = DOMAIN_BADGE[domain] ?? { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
                return (
                  <div
                    key={domain}
                    className={`border rounded-xl p-5 text-center space-y-2 ${badge.bg} ${badge.border}`}
                  >
                    <div className={`text-xs font-semibold uppercase tracking-wider ${badge.text}`}>
                      {DOMAIN_LABELS[domain] ?? domain}
                    </div>
                    <div className={`text-3xl font-bold ${badge.text}`}>
                      {stats.averageComposite.toFixed(1)}
                      <span className="text-sm font-normal opacity-50">/5</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {stats.scenariosCompleted} {stats.scenariosCompleted === 1 ? 'scenario' : 'scenarios'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Item review ── */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Question Review</h2>
          {session.items.length === 0 ? (
            <p className="text-gray-400 text-sm">No items recorded for this session.</p>
          ) : (
            session.items.map((item) => <ItemReview key={item.id} item={item} />)
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-200 pt-8 space-y-4 text-center pb-8">
          <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
            This report was generated by <span className="font-medium text-gray-500">Milo</span>, Inquire&apos;s adaptive AI scoring engine. Scores reflect the depth and sophistication of your questions, not the correctness of any answers.
          </p>
          <Link
            href="/"
            className="inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
