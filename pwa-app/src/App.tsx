import InstallPrompt from "./components/InstallPrompt";
import useOnlineStatus from "./hooks/useOnlineStatus";

function App() {
  const isOnline = useOnlineStatus();

  const quickStats = [
    { label: "Status", value: isOnline ? "Online" : "Offline" },
    { label: "Mode", value: "PWA" },
    { label: "Ready", value: isOnline ? "Install" : "Cached Use" },
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

          <div className="relative">
            <aside className="mx-auto max-w-4xl rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/30 sm:p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Current State</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                {isOnline ? "Ready to install and demo" : "Offline, but still usable"}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {isOnline
                  ? "This starter is in a good state for testing the full progressive web app experience, including installability, responsive layout, and the custom install prompt."
                  : "The cached app shell is active, so the interface still loads and stays readable while live network-dependent behavior waits for the connection to return."}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                {isOnline
                  ? "Everything here is kept intentionally minimal so the status of the app is easy to understand at a glance."
                  : "This view keeps the important signals visible so offline behavior is obvious without adding unnecessary sections."}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {quickStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-3 text-lg font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>

      <InstallPrompt />
    </div>
  );
}

export default App;
