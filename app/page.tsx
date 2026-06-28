import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-8">
      <div className="max-w-2xl text-center">
        <div className="mb-6 inline-block">
          <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">
            University Entrance Assessment
          </span>
        </div>
        <h1 className="text-6xl font-bold mb-4 tracking-tight">Inquire</h1>
        <p className="text-slate-400 text-xl mb-3 max-w-lg mx-auto leading-relaxed">
          A new kind of assessment. Show what you can ask — not just what you know.
        </p>
        <p className="text-slate-500 text-base mb-12 max-w-md mx-auto leading-relaxed">
          You will be presented with real-world scenarios. Your task is to write the best questions you can about each one. The depth and sophistication of your questions is what we measure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/test"
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Begin Assessment
          </Link>
          <Link
            href="/dashboard"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Educator Dashboard
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 text-left">
          {[
            { label: 'Critical Thinking', desc: 'Do your questions surface assumptions and seek causes?' },
            { label: 'Content Knowledge', desc: 'Do your questions reveal you understand the domain?' },
            { label: 'Reading Comprehension', desc: 'Do your questions build on what you were given?' },
          ].map(({ label, desc }) => (
            <div key={label} className="border border-slate-800 rounded-lg p-4">
              <div className="text-violet-400 font-semibold text-sm mb-1">{label}</div>
              <div className="text-slate-500 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
