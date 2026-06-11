import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Button } from '../components/ui/Button';
import { decrement, increment, reset } from '../features/counter/counterSlice';

const technologies = [
  'Vite',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Redux Toolkit',
  'RTK Query',
  'React Router',
  'React Hook Form',
  'Zod',
  'Sonner',
  'Vite PWA',
  'ESLint',
  'Prettier',
];

export function HomePage() {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.counter.value);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">
          Starter Template
        </span>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Vite React TypeScript Starter
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            A clean project foundation with modern tooling, state management,
            data fetching, routing, and sensible frontend defaults.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Included Technologies
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Counter Demo
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              This uses the existing Redux Toolkit slice and typed hooks setup.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-600">
              Current value
            </span>
            <span className="text-2xl font-bold text-slate-900">{count}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => dispatch(increment())}>Increment</Button>
            <Button variant="secondary" onClick={() => dispatch(decrement())}>
              Decrement
            </Button>
            <Button variant="secondary" onClick={() => dispatch(reset())}>
              Reset
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Toast Demo
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Sonner is already mounted globally in the root layout, so any page
              can trigger notifications.
            </p>
          </div>

          <Button
            className="mt-6 bg-emerald-600 hover:bg-emerald-500"
            onClick={() =>
              toast.success('Sonner is connected and ready to use.')
            }
          >
            Show Toast
          </Button>
        </div>
      </section>
    </div>
  );
}
