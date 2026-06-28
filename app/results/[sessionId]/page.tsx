export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Your Results</h1>
        <p className="text-slate-500 text-xs mb-6">Session: {sessionId}</p>
        <p className="text-slate-400 text-sm">Results view — Phase 2 build.</p>
      </div>
    </main>
  )
}
