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

  // Create session on mount — eager so it's ready when Begin is clicked
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
      } catch (e) {
        setError('Could not start a session. Please refresh and try again.')
      }
    }
    createSession()
  }, [])

  // Fetch next scenario
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
    } catch (e) {
      setError('Failed to load the next scenario. Please try again.')
      setAppState(appState === 'idle' ? 'idle' : 'scored')
    }
  }, [timer, appState])

  // Handle Begin
  const handleBegin = () => {
    if (!sessionId) {
      setError('Session not ready yet. Please wait a moment and try again.')
      return
    }
    fetchNext(sessionId)
  }

  // Handle submission
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

      // Map API scores to our local type
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
    } catch (e) {
      setError('Submission failed. Please try again.')
      setAppState('questioning')
      timer.start()
    }
  }

  const canSubmit = questions.some((q) => q.trim().length > 0)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight text-white">
          Inquire
          <span className="ml-2 text-xs font-normal text-violet-400 uppercase tracking-widest">
            Assessment
          </span>
        </span>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          {itemsCompleted > 0 && (
            <span>
              Scenarios completed:{' '}
              <span className="text-slate-200 font-semibold">{itemsCompleted}</span>
            </span>
          )}
          {appState === 'questioning' && (
            <span className="font-mono text-violet-400 tabular-nums">
              {timer.format(timer.elapsed)}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-950/50 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── IDLE ── */}
        {appState === 'idle' && (
          <div className="text-center py-20">
            <div className="mb-3 text-violet-400 text-xs font-semibold uppercase tracking-widest">
              Adaptive Question Assessment
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Ready to begin?</h1>
            <p className="text-slate-400 text-base max-w-md mx-auto mb-2 leading-relaxed">
              You will be shown real-world scenarios and asked to write 1–3 questions about each one.
            </p>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
              Your questions reveal how you think. There are no right answers — only the quality of your curiosity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
              {[
                { icon: '⏱', label: 'Take your time', desc: 'No time limit. Think before you write.' },
                { icon: '✏️', label: 'Write 1–3 questions', desc: 'One is required. More is encouraged.' },
                { icon: '🔍', label: 'Ask deeply', desc: "Surface curiosity you actually have." },
              ].map(({ icon, label, desc }) => (
                <div
                  key={label}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4"
                >
                  <div className="text-xl mb-2">{icon}</div>
                  <div className="text-sm font-semibold text-slate-200 mb-1">{label}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
            <button
              onClick={handleBegin}
              disabled={!sessionId}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-10 py-3.5 rounded-lg transition-colors text-base"
            >
              {sessionId ? 'Begin Assessment' : 'Preparing…'}
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {appState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading scenario…</p>
          </div>
        )}

        {/* ── QUESTIONING ── */}
        {appState === 'questioning' && currentItem && (
          <div className="space-y-6">
            <ScenarioCard
              domain={currentItem.scenario.domain}
              contextLevel={currentItem.scenario.contextLevel}
              title={currentItem.scenario.title}
              scenarioText={currentItem.scenario.scenarioText}
              contextText={currentItem.scenario.contextText}
            />

            <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Your Questions
                </h3>
                <span className="text-xs text-slate-500 italic">
                  Write the most insightful questions you can. You are not answering — you are asking.
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
                  className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-7 py-2.5 rounded-lg transition-colors text-sm"
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
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-300 text-base font-medium">Analyzing your questions…</p>
            <p className="text-slate-500 text-sm">Claude is scoring 5 dimensions of inquiry quality</p>
          </div>
        )}

        {/* ── SCORED ── */}
        {appState === 'scored' && currentItem && scores.length > 0 && (
          <div className="space-y-6">
            {/* Scenario recap header */}
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>Scores for:</span>
              <span className="text-slate-200 font-medium">{currentItem.scenario.title}</span>
            </div>

            {/* Overall composite if multiple questions */}
            {scores.length > 1 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 flex items-center gap-4">
                <span className="text-slate-400 text-sm">Session composite (this item)</span>
                <span className="text-lg font-bold text-white">
                  {(scores.reduce((s, r) => s + r.composite, 0) / scores.length).toFixed(2)}{' '}
                  <span className="text-slate-500 font-normal text-sm">/ 5</span>
                </span>
              </div>
            )}

            {/* Per-question score cards */}
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
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-7 py-2.5 rounded-lg transition-colors text-sm"
              >
                Next Scenario →
              </button>
            </div>
          </div>
        )}

        {/* ── COMPLETE ── */}
        {appState === 'complete' && (
          <div className="text-center py-24">
            <div className="mb-3 text-green-400 text-xs font-semibold uppercase tracking-widest">
              Assessment Complete
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Well done.</h1>
            <p className="text-slate-400 text-base max-w-md mx-auto mb-10 leading-relaxed">
              You completed{' '}
              <span className="text-slate-200 font-semibold">{itemsCompleted}</span>{' '}
              {itemsCompleted === 1 ? 'scenario' : 'scenarios'}. Your results are ready.
            </p>
            {sessionId && (
              <Link
                href={`/results/${sessionId}`}
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-10 py-3.5 rounded-lg transition-colors text-base"
              >
                View Your Results
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
