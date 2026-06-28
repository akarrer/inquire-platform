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
    const t = setTimeout(() => setWidth(pct), 80)
    return () => clearTimeout(t)
  }, [pct, animate])

  let barColor = 'bg-red-400'
  if (score > 3.5) barColor = 'bg-emerald-500'
  else if (score >= 2.5) barColor = 'bg-amber-400'

  return (
    <div className="mb-3.5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-700">
          {label}
          <span className="text-gray-400 font-normal ml-1">({weight})</span>
        </span>
        <span className="text-xs font-semibold text-gray-800 tabular-nums">{score.toFixed(1)}<span className="text-gray-400 font-normal">/5</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
  let compositeBadge = 'bg-red-50 text-red-700 border-red-200'
  if (score.composite > 3.5) compositeBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  else if (score.composite >= 2.5) compositeBadge = 'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Question header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3 bg-gray-50">
        <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">
          {questionIndex + 1}
        </span>
        <p className="text-gray-700 text-sm leading-relaxed italic">&ldquo;{questionText}&rdquo;</p>
      </div>

      <div className="px-5 py-5">
        {/* Composite score */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
            Composite Score
          </span>
          <span className={`px-3 py-1 rounded-full border text-sm font-bold ${compositeBadge}`}>
            {score.composite.toFixed(2)} / 5
          </span>
        </div>

        {/* Dimension bars */}
        <DimensionBar label="Linguistic Sophistication" weight="15%" score={score.d1Linguistic} animate={animate} />
        <DimensionBar label="Content Knowledge" weight="30%" score={score.d2ContentKnowledge} animate={animate} />
        <DimensionBar label="Critical Thinking" weight="30%" score={score.d3CriticalThinking} animate={animate} />
        <DimensionBar label="Inquiry Depth" weight="25%" score={score.d4InquirySoph} animate={animate} />
        <DimensionBar label="Reading Comprehension" weight="—" score={score.d5ContextIntegration} animate={animate} />

        {/* Milo's Feedback */}
        {score.feedback && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Milo&apos;s Feedback
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{score.feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
}
