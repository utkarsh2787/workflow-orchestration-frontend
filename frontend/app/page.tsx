import Link from 'next/link'

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#05050a]/60 via-[#06060b]/40 to-transparent p-10 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
        <div className="absolute -inset-1 blur-3xl opacity-30 bg-gradient-to-r from-[#00ffea] via-[#6a00ff] to-[#ff4d94] animate-gradient-slow" style={{mixBlendMode: 'overlay'}} aria-hidden />

        <div className="relative z-10 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">Orchestrate workflows. Ship reliably.</h1>
            <p className="mt-4 text-zinc-300 max-w-xl">Compose, schedule and monitor resilient multi-step workflows — API calls, file transfers, scripts and email steps — with observability, retries and audit trails built in.</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#00ffea] to-[#6a00ff] px-6 py-3 font-semibold text-black shadow-[0_8px_30px_rgba(106,0,255,0.12)]">Get started</Link>
              <Link href="/login" className="inline-flex items-center gap-3 rounded-full border border-zinc-800 px-6 py-3 text-zinc-200">Sign in</Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-zinc-400">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-200 font-semibold">Scheduling</span>
                <span>Cron, interval & calendar-based triggers</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-200 font-semibold">Retries</span>
                <span>Automatic retry policies with backoff</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="rounded-xl bg-[#0a0a0c] border border-zinc-800 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
              <div className="text-xs uppercase text-zinc-500">About this platform</div>
              <h4 className="mt-3 text-lg font-semibold text-zinc-100">Reliable, observable workflow orchestration</h4>
              <p className="mt-2 text-zinc-300 text-sm">This platform helps teams automate multi-step processes by composing tasks (HTTP calls, file operations, scripts, email) into orchestrated workflows. It provides scheduling, robust retry policies, conditional branching, and centralized logging so you can run jobs reliably and investigate issues quickly.</p>

              <ul className="mt-4 list-disc list-inside text-zinc-400 space-y-2 text-sm">
                <li><strong>Compose:</strong> Build workflows from reusable task blocks and visual wiring.</li>
                <li><strong>Schedule & Trigger:</strong> Cron, webhook triggers, or manual runs with flexible calendars.</li>
                <li><strong>Resilience:</strong> Automatic retries, error handling policies, and status transitions.</li>
                <li><strong>Observe:</strong> Centralized run logs, alerts, and audit trails for each execution.</li>
              </ul>

              <div className="mt-4 border-t border-zinc-800 pt-3 text-sm text-zinc-400">
                <div><span className="font-semibold text-zinc-200">Integrations:</span> HTTP APIs, S3-compatible storage, SMTP, and webhooks.</div>
                <div className="mt-2"><span className="font-semibold text-zinc-200">Security:</span> Role-based access, audit logs, and secrets management.</div>
              </div>

              <div className="mt-4 flex justify-end">
                <Link href="/" className="text-xs text-[#00ffea] hover:underline">Learn more</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          {title: 'Compose tasks', desc: 'Build workflows from API calls, uploads, downloads, scripts and email steps.', icon: '🧩'},
          {title: 'Schedule & Trigger', desc: 'Cron schedules, webhooks or manual triggers with flexible calendars.', icon: '⏰'},
          {title: 'Observe & Alert', desc: 'Centralized logs, retry insights and alerting for failed runs.', icon: '📡'},
        ].map((f) => (
          <div key={f.title} className="p-6 bg-zinc-900/30 rounded-lg border border-zinc-800 backdrop-blur-sm hover:translate-y-[-6px] transition-transform">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-zinc-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-lg p-6 bg-gradient-to-b from-[#041018]/40 to-transparent border border-zinc-800">
        <h3 className="text-xl font-semibold">How it works</h3>
        <ol className="mt-4 list-decimal list-inside text-zinc-400 space-y-2">
          <li>Design tasks: HTTP calls, file ops, scripts, email steps.</li>
          <li>Compose into workflows with ordering, retries and conditional branches.</li>
          <li>Schedule or trigger runs; monitor logs, failures and retries in real time.</li>
        </ol>
       </section>
    </div>
  )
}

