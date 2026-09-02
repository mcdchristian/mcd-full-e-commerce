"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../store/authStore';
import { useCart } from '../store/cartStore';

const NAV_LINKS = [
  { href: '/products', label: 'Produits' },
  { href: '/categories', label: 'Catégories' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const closeMenu = () => setIsMenuOpen(false);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = query.trim();
    router.push(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : '/products');
    closeMenu();
  };

  // Rendered twice — beside the links on desktop, inside the panel on mobile —
  // so the ids have to differ even though the behaviour is identical.
  const searchForm = (id: string, className: string) => (
    <form onSubmit={handleSearch} role="search" className={className}>
      <label htmlFor={id} className="sr-only">
        Rechercher un produit
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher un produit..."
        className="w-full rounded-full bg-zinc-100 px-4 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-cyan-500 dark:bg-zinc-800"
      />
    </form>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
          <span className="text-xl font-bold tracking-tighter text-cyan-600 dark:text-cyan-400">
            E-SHOP
          </span>
        </Link>

        <div className="hidden flex-1 items-center gap-8 px-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap text-sm font-medium hover:text-cyan-500">
              {link.label}
            </Link>
          ))}
          {searchForm('nav-search-desktop', 'ml-auto w-full max-w-xs')}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative group p-2" onClick={closeMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-cyan-500 transition-colors">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-white">
              {totalItems}
            </span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                onClick={closeMenu}
                className="hidden text-sm font-medium hover:text-cyan-500 sm:inline"
              >
                Mes commandes
              </Link>
              <span className="hidden text-sm font-medium sm:inline">{user?.firstName}</span>
              <div className="h-8 w-8 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center text-cyan-600">
                {user?.firstName[0]}
              </div>
              <button 
                onClick={logout}
                className="text-xs font-bold text-red-500 hover:underline ml-2"
              >
                Quitter
              </button>
            </div>
          ) : (
            <Link 
              href="/auth/login" 
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all"
            >
              Connexion
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="-mr-2 p-2 md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMenuOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 12h16" />
                  <path d="M4 6h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mobile-nav" className="border-t border-zinc-200 dark:border-zinc-800 md:hidden">
          <div className="container mx-auto flex flex-col px-4 py-3">
            {searchForm('nav-search-mobile', 'mb-2')}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="py-3 text-sm font-medium hover:text-cyan-500"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
