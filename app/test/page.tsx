'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import ScenarioCard from '@/components/ScenarioCard'
import ScoreCard from '@/components/ScoreCard'
import QuestionInput from '@/components/QuestionInput'
import type { Domain, ContextLevel } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type AppState = 'idle' | 'loading' | 'questioning' | 'submitting' | 'scored' | 'complete'

interface Scenario {
  id: string
  domain: Domain
  contextLevel: ContextLevel
  title: string
  scenarioText: string
  contextText?: string | null
}

interface SessionItem {
  id: string
  scenarioId: string
  scenario: Scenario
}

interface ScoreResult {
  d1Linguistic: number
  d2ContentKnowledge: number
  d3CriticalThinking: number
  d4InquirySoph: number
  d5ContextIntegration: number
  composite: number
  feedback: string
  questionText: string
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const start = useCallback(() => {
    startRef.current = Date.now()
    const tick = () => {
      if (startRef.current !== null) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    startRef.current = null
    return elapsed
  }, [elapsed])

  const reset = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    startRef.current = null
    setElapsed(0)
  }, [])

  const format = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  return { elapsed, format, start, stop, reset }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TestPage() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentItem, setCurrentItem] = useState<SessionItem | null>(null)
  const [questions, setQuestions] = useState(['', '', ''])
  const [scores, setScores] = useState<ScoreResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [itemsCompleted, setItemsCompleted] = useState(0)
  const timer = useTimer()

  useEffect(() => {
    async function createSession() {
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'demo-user' }),
        })
        if (!res.ok) throw new Error('Failed to create session')
        const session = await res.json()
        setSessionId(session.id)
      } catch {
        setError('Could not start a session. Please refresh and try again.')
      }
    }
    createSession()
  }, [])

  const fetchNext = useCallback(async (sid: string) => {
    setAppState('loading')
    setError(null)
    try {
      const res = await fetch(`/api/sessions/${sid}/next`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to load scenario')
      const data = await res.json()
      if (data.complete) {
        setAppState('complete')
        return
      }
      setCurrentItem(data as SessionItem)
      setQuestions(['', '', ''])
      timer.reset()
      setAppState('questioning')
      timer.start()
    } catch {
      setError('Failed to load the next scenario. Please try again.')
      setAppState(appState === 'idle' ? 'idle' : 'scored')
    }
  }, [timer, appState])

  const handleBegin = () => {
    if (!sessionId) {
      setError('Session not ready yet. Please wait a moment and try again.')
      return
    }
    fetchNext(sessionId)
  }

  const handleSubmit = async () => {
    if (!sessionId || !currentItem) return
    const filled = questions.filter((q) => q.trim().length > 0)
    if (filled.length === 0) return

    const elapsed = timer.stop()
    setAppState('submitting')
    setError(null)

    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/items/${currentItem.id}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions: filled, timeOnTask: elapsed }),
        }
      )
      if (!res.ok) throw new Error('Submission failed')
      const data = await res.json()

      const mapped: ScoreResult[] = data.scores.map(
        (s: {
          d1Linguistic: number
          d2ContentKnowledge: number
          d3CriticalThinking: number
          d4InquirySoph: number
          d5ContextIntegration: number
          composite: number
          feedback: string
          question?: { questionText: string }
        }, i: number) => ({
          d1Linguistic: s.d1Linguistic,
          d2ContentKnowledge: s.d2ContentKnowledge,
          d3CriticalThinking: s.d3CriticalThinking,
          d4InquirySoph: s.d4InquirySoph,
          d5ContextIntegration: s.d5ContextIntegration,
          composite: s.composite,
          feedback: s.feedback,
          questionText: filled[i] ?? '',
        })
      )

      setScores(mapped)
      setItemsCompleted((c) => c + 1)
      setAppState('scored')
    } catch {
      setError('Submission failed. Please try again.')
      setAppState('questioning')
      timer.start()
    }
  }

  const canSubmit = questions.some((q) => q.trim().length > 0)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-700 rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 13H2L8 2Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">Inquire</span>
          <span className="text-gray-300 text-sm hidden sm:block">/ Assessment</span>
        </Link>
        <div className="flex items-center gap-5 text-sm text-gray-500">
          {itemsCompleted > 0 && (
            <span>
              Completed:{' '}
              <span className="text-gray-800 font-semibold">{itemsCompleted}</span>
            </span>
          )}
          {appState === 'questioning' && (
            <span className="font-mono text-indigo-600 tabular-nums bg-indigo-50 px-2.5 py-1 rounded-md text-xs font-semibold">
              {timer.format(timer.elapsed)}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── IDLE ── */}
        {appState === 'idle' && (
          <div className="text-center py-16">
            <div className="mb-3 text-indigo-600 text-xs font-semibold uppercase tracking-widest">
              Adaptive Question Assessment
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight text-gray-900">Ready to begin?</h1>
            <p className="text-gray-500 text-base max-w-md mx-auto mb-2 leading-relaxed">
              You will be shown real-world scenarios and asked to write 1–3 questions about each one.
            </p>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-10 leading-relaxed">
              Your questions reveal how you think. There are no right answers — only the quality of your curiosity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
              {[
                { label: 'Take your time', desc: 'No time limit. Think carefully before you write.' },
                { label: 'Write 1–3 questions', desc: 'One is required. More is encouraged.' },
                { label: 'Ask deeply', desc: 'Surface the curiosity you actually have.' },
              ].map(({ label, desc }) => (
                <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900 mb-1">{label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
            <button
              onClick={handleBegin}
              disabled={!sessionId}
              className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-10 py-3.5 rounded-lg transition-colors text-base"
            >
              {sessionId ? 'Begin Assessment' : 'Preparing…'}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {appState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading scenario…</p>
          </div>
        )}

        {/* ── QUESTIONING ── */}
        {appState === 'questioning' && currentItem && (
          <div className="space-y-5">
            <ScenarioCard
              domain={currentItem.scenario.domain}
              contextLevel={currentItem.scenario.contextLevel}
              title={currentItem.scenario.title}
              scenarioText={currentItem.scenario.scenarioText}
              contextText={currentItem.scenario.contextText}
            />

            <div className="bg-white border border-gray-200 rounded-xl px-6 py-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Your Questions
                </h3>
                <span className="text-xs text-gray-400 italic hidden sm:block">
                  You are asking, not answering.
                </span>
              </div>
              <QuestionInput
                questions={questions}
                onChange={(i, v) => {
                  const next = [...questions]
                  next[i] = v
                  setQuestions(next)
                }}
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-7 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Submit My Questions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SUBMITTING ── */}
        {appState === 'submitting' && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-800 text-base font-semibold">Milo is reviewing your questions…</p>
            <p className="text-gray-400 text-sm">Evaluating 5 dimensions of inquiry quality</p>
          </div>
        )}

        {/* ── SCORED ── */}
        {appState === 'scored' && currentItem && scores.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Results for:</span>
              <span className="text-gray-900 font-semibold">{currentItem.scenario.title}</span>
            </div>

            {scores.length > 1 && (
              <div className="bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-sm flex items-center gap-4">
                <span className="text-gray-500 text-sm">Item composite</span>
                <span className="text-lg font-bold text-gray-900">
                  {(scores.reduce((s, r) => s + r.composite, 0) / scores.length).toFixed(2)}
                  <span className="text-gray-400 font-normal text-sm"> / 5</span>
                </span>
              </div>
            )}

            <div className="space-y-4">
              {scores.map((s, i) => (
                <ScoreCard
                  key={i}
                  questionText={s.questionText}
                  questionIndex={i}
                  score={s}
                  animate
                />
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => sessionId && fetchNext(sessionId)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-7 py-2.5 rounded-lg transition-colors text-sm"
              >
                Next Scenario →
              </button>
            </div>
          </div>
        )}

        {/* ── COMPLETE ── */}
        {appState === 'complete' && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="mb-2 text-emerald-600 text-xs font-semibold uppercase tracking-widest">
              Assessment Complete
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight text-gray-900">Well done.</h1>
            <p className="text-gray-500 text-base max-w-md mx-auto mb-10 leading-relaxed">
              You completed{' '}
              <span className="text-gray-900 font-semibold">{itemsCompleted}</span>{' '}
              {itemsCompleted === 1 ? 'scenario' : 'scenarios'}. Milo has finished scoring your responses.
            </p>
            {sessionId && (
              <Link
                href={`/results/${sessionId}`}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-10 py-3.5 rounded-lg transition-colors text-base"
              >
                View Your Results
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
