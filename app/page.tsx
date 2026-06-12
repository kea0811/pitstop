import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { Logo } from '@/components/ui/Logo';
import { BarcodeIcon, SparkPhotoIcon, CarIcon } from '@/components/ui/icons';

export const dynamic = 'force-dynamic';

const features = [
  {
    Icon: BarcodeIcon,
    title: 'Scan the barcode',
    body: 'Carded car? Scan the UPC and the details fill themselves in — saved in seconds.',
  },
  {
    Icon: SparkPhotoIcon,
    title: 'Match loose cars by photo',
    body: 'Snap a top-down photo and on-device AI finds it in your collection. Nothing leaves your phone.',
  },
  {
    Icon: CarIcon,
    title: 'Never double-buy',
    body: 'It flags “you may already own this” before you’re at the till. Browse the whole garage offline.',
  },
];

export default async function LandingPage() {
  // Signed-in visitors go straight to their collection; everyone else sees the
  // marketing page (the homepage is no longer the login screen).
  const user = await getSessionUser();
  if (user) redirect('/collection');

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 pb-16 pt-safe">
      {/* Nav */}
      <nav className="flex items-center justify-between">
        <span className="flex items-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="text-lg font-extrabold uppercase tracking-tight text-ink">
            Pit<span className="text-accent">stop</span>
          </span>
        </span>
        <Link
          href="/login"
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-ink hover:border-accent/60"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <Logo className="h-20 w-20" />
        <h1 className="max-w-2xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Your diecast collection,<br />
          <span className="text-accent">one scan away.</span>
        </h1>
        <p className="max-w-xl text-pretty text-lg text-ink-muted">
          Pitstop is a phone-first catalog for diecast collectors. Scan barcodes, photo-match
          loose cars with on-device AI, and know exactly what you own — even offline.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="flex min-h-12 items-center rounded-full bg-accent px-7 text-base font-bold text-bg transition-transform active:scale-95"
          >
            Get started
          </Link>
          <a
            href="https://github.com/kea0811/pitstop"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 items-center rounded-full border border-white/15 px-7 text-base font-semibold text-ink hover:border-accent/60"
          >
            View on GitHub
          </a>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">
          Free · open source · installs to your home screen
        </p>
      </section>

      {/* Features */}
      <section className="grid gap-4 sm:grid-cols-3">
        {features.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-panel p-6">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent">
              <Icon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
            <p className="mt-2 text-sm text-ink-muted">{body}</p>
          </div>
        ))}
      </section>

      {/* Closing CTA */}
      <section className="mt-16 flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-panel px-6 py-14 text-center">
        <h2 className="max-w-xl text-2xl font-extrabold text-ink sm:text-3xl">
          Stop guessing what you own.
        </h2>
        <Link
          href="/login"
          className="flex min-h-12 items-center rounded-full bg-accent px-7 text-base font-bold text-bg transition-transform active:scale-95"
        >
          Start your collection
        </Link>
      </section>

      <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        <span>Pitstop</span>
        <span aria-hidden>·</span>
        <span>MIT licensed</span>
        <span aria-hidden>·</span>
        <a href="https://github.com/kea0811/pitstop" className="hover:text-ink" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>
    </main>
  );
}
