function Offline() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-20 sm:px-8">
      <section className="relative w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-10">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-36 w-36 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Offline mode active
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
              You are offline, but the app shell is still available.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              The service worker keeps the core interface, styles, and cached assets ready so the
              app can still open cleanly without a network connection.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Try Again
              </button>
              <div className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600">
                Reconnect to refresh live data
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/30">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-300">Still Available</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-base font-semibold text-emerald-300">Cached UI</h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  The landing page layout and static design assets should continue to load.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-base font-semibold text-emerald-300">Installed Experience</h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  If you installed the PWA, it can still launch directly from your device.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-base font-semibold text-emerald-300">What Needs Internet</h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Fresh API responses and anything not already cached will need the network again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Offline;
