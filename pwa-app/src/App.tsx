import InstallPrompt from "./components/InstallPrompt";
import useOnlineStatus from "./hooks/useOnlineStatus";

function App() {
  const isOnline = useOnlineStatus();

  const highlights = [
    {
      title: "Installable",
      description: "Add this app to your home screen and launch it like a native experience.",
    },
    {
      title: "Offline Ready",
      description: "Key assets stay available even when your connection drops unexpectedly.",
    },
    {
      title: "Fast Reloads",
      description: "Vite keeps local development snappy while your PWA features stay in place.",
    },
  ];

  const quickStats = [
    { label: "Status", value: isOnline ? "Live" : "Offline" },
    { label: "Mode", value: "PWA" },
    { label: "Ready For", value: isOnline ? "Install" : "Cached Use" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_35%),linear-gradient(135deg,#fff8eb_0%,#f8fafc_45%,#eef2ff_100%)] text-slate-900">
      {!isOnline && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-amber-300/60 bg-amber-100/95 px-4 py-3 text-center text-sm font-medium text-amber-950 backdrop-blur">
          You are offline. Cached content should still work while the network is unavailable.
        </div>
      )}

      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-16 pt-10 sm:px-8 lg:px-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 px-6 py-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur xl:px-10 xl:py-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-300/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
                {isOnline ? "Progressive Web App playground" : "Offline-first app shell active"}
              </div>

              <h1 className="max-w-xl text-5xl font-black tracking-[-0.04em] text-slate-950 sm:text-6xl">
                Build a web app that feels polished, installable, and resilient. (Updated 2)
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                {isOnline
                  ? "This starter now doubles as a clean product-style landing screen so you can test PWA behavior without staring at a blank page."
                  : "You are offline, but the cached interface is still here. Static content should stay stable while network-dependent features wait for reconnection."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800">
                  Explore Features
                </button>
                <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50">
                  {isOnline ? "Test Install Flow" : "Review Cached Experience"}
                </button>
              </div>
            </div>

            <div className="grid w-full max-w-md gap-4">
              <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/30">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Live Status</p>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">
                      {isOnline ? "All systems ready" : "Cached mode active"}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {isOnline
                        ? "Service worker, manifest, and install UI are wired up."
                        : "The app shell is loaded from cache while live network features wait."}
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-2 text-sm font-semibold ${
                      isOnline
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-amber-400/15 text-amber-200"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {quickStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-3 text-lg font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                  Core Experience
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Designed for the moments users actually notice
                </h2>
              </div>
              <div className="hidden rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700 sm:block">
                Smooth on desktop and mobile
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <div className="mb-4 h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500" />
                  <h3 className="text-xl font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
              PWA Checklist
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              {isOnline ? "Ready to demo" : "Offline but stable"}
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-emerald-300">Manifest</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  App icons and metadata are present so browsers can evaluate installability.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-emerald-300">Service Worker</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {isOnline
                    ? "Offline behavior is registered through the Vite PWA plugin instead of a missing static script."
                    : "Cached HTML, CSS, JS, and images keep the main static design available while you are disconnected."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-emerald-300">Install Flow</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {isOnline
                    ? "Open this in Chrome or Edge on localhost to test the custom install prompt."
                    : "Reconnect to continue install testing or refresh anything that depends on live network data."}
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <InstallPrompt />
    </div>
  );
}

export default App;
