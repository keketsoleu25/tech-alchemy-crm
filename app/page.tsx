import Link from "next/link";

const MODULES = [
  {
    name: "Clients",
    desc: "Every contact and company you work with, in one place.",
  },
  {
    name: "Projects",
    desc: "Track scope, budget, and timeline against each client.",
  },
  {
    name: "Tasks",
    desc: "Break projects into work that actually gets checked off.",
  },
  {
    name: "Invoices",
    desc: "Line items, tax, and totals — turned into something payable.",
  },
  {
    name: "Notifications",
    desc: "Know what changed without digging for it.",
  },
];

const PIPELINE = ["Clients", "Projects", "Tasks", "Invoices"];

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <header className="border-b border-gray-900">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-serif text-lg tracking-tight">
            Tech Alchemy <span className="text-gray-500">CRM</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm rounded-md bg-amber-400 text-black px-4 py-2 font-medium hover:bg-amber-300 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="font-mono text-xs tracking-widest text-amber-400/80 uppercase mb-4">
          Client work, refined
        </p>
        <h1 className="font-serif text-4xl sm:text-6xl leading-[1.05] tracking-tight max-w-3xl">
          Turn client chaos into{" "}
          <span className="text-amber-400">finished, paid work.</span>
        </h1>
        <p className="mt-6 text-gray-400 text-lg max-w-xl">
          Tech Alchemy CRM carries a job from first contact to final invoice —
          clients, projects, tasks, and billing, all connected instead of
          scattered across five different tools.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/register"
            className="rounded-md bg-amber-400 text-black px-5 py-2.5 font-medium hover:bg-amber-300 transition-colors"
          >
            Create your account
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-gray-700 px-5 py-2.5 font-medium text-gray-200 hover:bg-gray-900 transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Signature: the pipeline */}
        <div className="mt-20">
          <p className="font-mono text-xs tracking-widest text-gray-600 uppercase mb-6">
            The pipeline
          </p>
          <div className="relative flex items-center justify-between max-w-2xl">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-1/2 h-px bg-gray-800"
            />
            {PIPELINE.map((step, i) => (
              <div
                key={step}
                className="relative flex flex-col items-center gap-3 bg-black px-2"
              >
                <div
                  className="w-3 h-3 rounded-full bg-amber-400 motion-safe:animate-pulse motion-reduce:animate-none"
                  style={{ animationDelay: `${i * 0.4}s` }}
                  aria-hidden
                />
                <span className="font-mono text-xs sm:text-sm text-gray-300">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-900">
        <h2 className="font-serif text-2xl mb-2">Everything stays linked</h2>
        <p className="text-gray-500 mb-10 max-w-xl">
          A project points back to its client. A task points back to its
          project. An invoice can pull from either. Nothing lives in
          isolation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-gray-800 bg-gray-950 p-5 hover:border-gray-700 transition-colors"
            >
              <p className="font-medium text-white mb-1">{m.name}</p>
              <p className="text-sm text-gray-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-900">
        <div className="rounded-2xl border border-gray-800 bg-gray-950 px-8 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl text-white mb-1">
              Ready to get organized?
            </h3>
            <p className="text-gray-500 text-sm">
              Set up your first client in under a minute.
            </p>
          </div>
          <Link
            href="/register"
            className="shrink-0 rounded-md bg-amber-400 text-black px-5 py-2.5 font-medium hover:bg-amber-300 transition-colors text-center"
          >
            Create your account
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-600 font-mono">
            <span>© {year} Keketso Leu. All rights reserved.</span>
            <span>Built by Keketso Leu · Powered by The Alchemy Lab</span>
          </div>
          <p className="text-xs text-gray-700 max-w-2xl">
            This source code is available for portfolio review only. No
            permission is granted to copy, modify, distribute, sublicense, or
            use it commercially without written permission.
          </p>
        </div>
      </footer>
    </div>
  );
}

