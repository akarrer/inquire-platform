'use client'

import { useState } from 'react'
import type { Domain, ContextLevel } from '@/lib/types'

const DOMAIN_STYLES: Record<Domain, { bg: string; text: string; border: string; label: string }> = {
  MATH: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Mathematics' },
  ELA: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', label: 'English Language Arts' },
  SCIENCE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Science' },
}

const CONTEXT_TOOLTIPS: Record<ContextLevel, string> = {
  SPARSE: 'You have minimal background information. Your questions must work from limited context.',
  PARTIAL: 'You have some background information. Use it to deepen your questions.',
  RICH: 'You have detailed background information. Your questions should engage with the full context provided.',
}

const CONTEXT_LEVEL_STYLES: Record<ContextLevel, { bg: string; text: string; border: string }> = {
  SPARSE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  PARTIAL: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  RICH: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
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
  const contextStyle = CONTEXT_LEVEL_STYLES[contextLevel]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5 flex-wrap bg-gray-50">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${domainStyle.bg} ${domainStyle.text} ${domainStyle.border}`}
        >
          {domainStyle.label}
        </span>

        {/* Context level badge with tooltip */}
        <div className="relative">
          <button
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border cursor-help ${contextStyle.bg} ${contextStyle.text} ${contextStyle.border}`}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            onFocus={() => setTooltipVisible(true)}
            onBlur={() => setTooltipVisible(false)}
            aria-describedby="context-tooltip"
          >
            {contextLevel} context
            <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" d="M12 8v4M12 16h.01" strokeWidth="2" />
            </svg>
          </button>

          {tooltipVisible && (
            <div
              id="context-tooltip"
              role="tooltip"
              className="absolute left-0 top-9 z-10 w-64 bg-gray-900 rounded-lg p-3 text-xs text-gray-200 leading-relaxed shadow-xl"
            >
              <span className="font-semibold text-white">{contextLevel}: </span>
              {CONTEXT_TOOLTIPS[contextLevel]}
            </div>
          )}
        </div>

        <span className="ml-auto text-gray-400 text-xs font-medium tracking-wide uppercase">
          Scenario
        </span>
      </div>

      {/* Scenario content */}
      <div className="px-6 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 leading-snug">{title}</h2>
        <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{scenarioText}</p>
      </div>

      {/* Context section */}
      {contextText && (
        <div className="mx-6 mb-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
            Context Provided
          </div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{contextText}</p>
        </div>
      )}
    </div>
  )
}
