'use client'

import { useEffect, useState } from 'react'

interface DimensionBarProps {
  label: string
  weight: string
  score: number
  animate: boolean
}

function DimensionBar({ label, weight, score, animate }: DimensionBarProps) {
  const [width, setWidth] = useState(0)
  const pct = (score / 5) * 100

  useEffect(() => {
    if (!animate) {
      setWidth(pct)
      return
    }
    const t = setTimeout(() => setWidth(pct), 50)
    return () => clearTimeout(t)
  }, [pct, animate])

  let barColor = 'bg-red-500'
  if (score > 3.5) barColor = 'bg-green-500'
  else if (score >= 3) barColor = 'bg-yellow-500'

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-300">
          {label}{' '}
          <span className="text-slate-500 font-normal">({weight})</span>
        </span>
        <span className="text-xs font-semibold text-slate-200">{score.toFixed(1)}/5</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

interface ScoreData {
  d1Linguistic: number
  d2ContentKnowledge: number
  d3CriticalThinking: number
  d4InquirySoph: number
  d5ContextIntegration: number
  composite: number
  feedback: string
}

interface ScoreCardProps {
  questionText: string
  questionIndex: number
  score: ScoreData
  animate?: boolean
}

export default function ScoreCard({
  questionText,
  questionIndex,
  score,
  animate = true,
}: ScoreCardProps) {
  let compositeColor = 'text-red-400 border-red-700 bg-red-950/30'
  if (score.composite > 3.5) compositeColor = 'text-green-400 border-green-700 bg-green-950/30'
  else if (score.composite >= 3) compositeColor = 'text-yellow-400 border-yellow-700 bg-yellow-950/30'

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Question header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-start gap-3">
        <span className="shrink-0 w-6 h-6 rounded-full bg-violet-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">
          {questionIndex + 1}
        </span>
        <p className="text-slate-200 text-sm leading-relaxed italic">"{questionText}"</p>
      </div>

      <div className="px-5 py-4">
        {/* Composite score */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Composite Score
          </span>
          <span
            className={`px-3 py-1 rounded-full border text-sm font-bold ${compositeColor}`}
          >
            {score.composite.toFixed(2)} / 5
          </span>
        </div>

        {/* Dimension bars */}
        <DimensionBar label="D1 Linguistic" weight="15%" score={score.d1Linguistic} animate={animate} />
        <DimensionBar label="D2 Content Knowledge" weight="30%" score={score.d2ContentKnowledge} animate={animate} />
        <DimensionBar label="D3 Critical Thinking" weight="30%" score={score.d3CriticalThinking} animate={animate} />
        <DimensionBar label="D4 Inquiry Depth" weight="25%" score={score.d4InquirySoph} animate={animate} />
        <DimensionBar label="D5 Reading Comprehension" weight="—" score={score.d5ContextIntegration} animate={animate} />

        {/* Feedback */}
        {score.feedback && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Feedback
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{score.feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
}
