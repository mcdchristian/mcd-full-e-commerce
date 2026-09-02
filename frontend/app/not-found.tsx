import Link from 'next/link';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Page introuvable — E-Commerce Premium',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-7xl font-black tracking-tighter text-cyan-600 dark:text-cyan-400">404</p>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Cette page n&apos;existe pas</h1>
        <p className="mt-4 max-w-md text-zinc-500">
          Le lien est peut-être périmé, ou l&apos;adresse comporte une erreur.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/products"
            className="rounded-2xl bg-zinc-900 px-8 py-4 font-bold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Voir le catalogue
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-zinc-200 px-8 py-4 font-bold transition-all hover:border-cyan-500 hover:text-cyan-600 dark:border-zinc-800"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
