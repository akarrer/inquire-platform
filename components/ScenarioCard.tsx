'use client'

import { useState } from 'react'
import type { Domain, ContextLevel } from '@/lib/types'

const DOMAIN_STYLES: Record<Domain, { bg: string; text: string; label: string }> = {
  MATH: { bg: 'bg-blue-900/50', text: 'text-blue-300', label: 'Mathematics' },
  ELA: { bg: 'bg-purple-900/50', text: 'text-purple-300', label: 'English Language Arts' },
  SCIENCE: { bg: 'bg-green-900/50', text: 'text-green-300', label: 'Science' },
}

const CONTEXT_TOOLTIPS: Record<ContextLevel, string> = {
  SPARSE: 'You have minimal background information. Your questions must work from limited context.',
  PARTIAL: 'You have some background information. Use it to deepen your questions.',
  RICH: 'You have detailed background information. Your questions should engage with the full context provided.',
}

interface ScenarioCardProps {
  domain: Domain
  contextLevel: ContextLevel
  title: string
  scenarioText: string
  contextText?: string | null
}

export default function ScenarioCard({
  domain,
  contextLevel,
  title,
  scenarioText,
  contextText,
}: ScenarioCardProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const domainStyle = DOMAIN_STYLES[domain]

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3 flex-wrap">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${domainStyle.bg} ${domainStyle.text}`}
        >
          {domainStyle.label}
        </span>

        {/* Context level badge with tooltip */}
        <div className="relative">
          <button
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-help"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            onFocus={() => setTooltipVisible(true)}
            onBlur={() => setTooltipVisible(false)}
            aria-describedby="context-tooltip"
          >
            {contextLevel}
            <svg
              className="w-3 h-3 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" d="M12 8v4M12 16h.01" strokeWidth="2" />
            </svg>
          </button>

          {tooltipVisible && (
            <div
              id="context-tooltip"
              role="tooltip"
              className="absolute left-0 top-8 z-10 w-64 bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 leading-relaxed shadow-xl"
            >
              <span className="font-semibold text-slate-200">{contextLevel} context: </span>
              {CONTEXT_TOOLTIPS[contextLevel]}
            </div>
          )}
        </div>

        <span className="ml-auto text-slate-500 text-xs font-mono">Scenario</span>
      </div>

      {/* Scenario content */}
      <div className="px-6 py-6">
        <h2 className="text-xl font-semibold text-white mb-4 leading-snug">{title}</h2>
        <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap">{scenarioText}</p>
      </div>

      {/* Context section */}
      {contextText && (
        <div className="mx-6 mb-6 bg-slate-800/60 border border-slate-700 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Context Provided
          </div>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{contextText}</p>
        </div>
      )}
    </div>
  )
}
