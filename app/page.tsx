import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-700 rounded-md flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 13H2L8 2Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Inquire</span>
          </div>
          <Link
            href="/test"
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm"
          >
            Begin Assessment
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest">
              University Entrance Assessment
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-5 tracking-tight leading-tight">
              Show what you can ask,<br className="hidden sm:block" /> not just what you know.
            </h1>
            <p className="text-gray-500 text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
              Inquire presents you with real-world scenarios. Your task is to write the most insightful questions you can about each one.
            </p>
            <p className="text-gray-400 text-base mb-10 max-w-xl mx-auto leading-relaxed">
              The depth, sophistication, and curiosity behind your questions reveal what you know and how you think.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/test"
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-base"
              >
                Begin Assessment
              </Link>
              <Link
                href="/dashboard"
                className="border border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:text-gray-900 font-semibold px-8 py-3.5 rounded-lg transition-colors text-base"
              >
                Educator Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* What we measure */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-center text-gray-400 text-xs font-semibold uppercase tracking-widest mb-10">
            What Inquire Measures
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                num: '01',
                label: 'Critical Thinking',
                desc: 'Do your questions surface hidden assumptions, probe causes, and look beyond the surface of what was given?',
              },
              {
                num: '02',
                label: 'Content Knowledge',
                desc: 'Do your questions reveal that you understand the domain, its variables, and its underlying structure?',
              },
              {
                num: '03',
                label: 'Reading Comprehension',
                desc: 'Do your questions demonstrate that you fully processed and built upon the context provided to you?',
              },
            ].map(({ num, label, desc }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-indigo-200 mb-3">{num}</div>
                <div className="text-base font-semibold text-gray-900 mb-2">{label}</div>
                <div className="text-gray-500 text-sm leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-14">
            <p className="text-center text-gray-400 text-xs font-semibold uppercase tracking-widest mb-10">
              How It Works
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                {
                  step: '1',
                  title: 'Read the Scenario',
                  desc: 'You receive a real-world situation with varying levels of contextual information.',
                },
                {
                  step: '2',
                  title: 'Write Your Questions',
                  desc: 'Write up to three questions about the scenario. Depth and quality are what matter.',
                },
                {
                  step: '3',
                  title: 'Receive Your Report',
                  desc: 'Milo, our AI scoring engine, evaluates your questions across five dimensions of inquiry.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-bold text-sm flex items-center justify-center">
                    {step}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">{title}</div>
                  <div className="text-gray-400 text-sm leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-gray-400 text-sm">
            <span className="font-semibold text-gray-600">Inquire</span>
            {' · '}University Entrance Assessment Platform
          </div>
          <div className="text-xs text-gray-400">
            Scored by <span className="font-semibold text-gray-500">Milo</span> — Inquire&apos;s adaptive AI engine
          </div>
        </div>
      </footer>
    </div>
  )
}
