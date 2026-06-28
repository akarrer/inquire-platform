'use client'

const PLACEHOLDERS = [
  'What question would help you most deeply understand this scenario?',
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
        <div key={i} className="flex items-start gap-3">
          <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center mt-1 select-none">
            {i + 1}
          </span>
          <div className="flex-1">
            <textarea
              className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg px-4 py-3 text-gray-900 text-sm placeholder-gray-400 resize-none outline-none transition-all disabled:opacity-40 disabled:bg-gray-50"
              rows={3}
              value={q}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder={PLACEHOLDERS[i]}
              disabled={disabled}
              aria-label={`Question ${i + 1}`}
            />
            <div className="flex justify-between items-center mt-1.5 px-1">
              <span className="text-xs text-gray-400">
                {i === 0 ? (
                  <span className="text-indigo-500 font-medium">Required</span>
                ) : (
                  'Optional — encouraged'
                )}
              </span>
              <span className={`text-xs tabular-nums ${q.length > 300 ? 'text-amber-500' : 'text-gray-300'}`}>
                {q.length}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
