"use client";
import Link from 'next/link';
import { useAuth } from '../store/authStore';
import { useCart } from '../store/cartStore';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tighter text-cyan-600 dark:text-cyan-400">
            E-SHOP
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/products" className="text-sm font-medium hover:text-cyan-500">Produits</Link>
          <Link href="/categories" className="text-sm font-medium hover:text-cyan-500">Catégories</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative group p-2">
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
              <span className="text-sm font-medium">{user?.firstName}</span>
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
        </div>
      </div>
    </nav>
  );
}
