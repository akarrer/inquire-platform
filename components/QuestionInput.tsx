'use client'

const PLACEHOLDERS = [
  'What question would help you understand this scenario more deeply?',
  'What would you want to investigate further?',
  'What underlying question does this scenario raise for you?',
]

interface QuestionInputProps {
  questions: string[]
  onChange: (index: number, value: string) => void
  disabled?: boolean
}

export default function QuestionInput({ questions, onChange, disabled }: QuestionInputProps) {
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="relative">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-sm font-semibold flex items-center justify-center mt-1 select-none">
              {i + 1}
            </span>
            <div className="flex-1">
              <textarea
                className="w-full bg-slate-900 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded-lg px-4 py-3 text-slate-100 text-sm placeholder-slate-600 resize-none outline-none transition-colors disabled:opacity-40"
                rows={3}
                value={q}
                onChange={(e) => onChange(i, e.target.value)}
                placeholder={PLACEHOLDERS[i]}
                disabled={disabled}
                aria-label={`Question ${i + 1}`}
              />
              <div className="flex justify-between items-center mt-1 px-1">
                <span className="text-slate-600 text-xs">
                  {i === 0 ? (
                    <span className="text-violet-500/70">Required</span>
                  ) : (
                    <span>Optional — encouraged</span>
                  )}
                </span>
                <span
                  className={`text-xs tabular-nums ${
                    q.length > 300 ? 'text-yellow-500' : 'text-slate-600'
                  }`}
                >
                  {q.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
