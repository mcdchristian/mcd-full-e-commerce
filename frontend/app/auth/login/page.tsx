"use client";
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../../store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { getApiErrorMessage, safeRedirectPath } from '../../../lib/errors';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      // /cart sends visitors here with ?redirect=/cart; send them back.
      router.push(safeRedirectPath(searchParams.get('redirect')));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Email ou mot de passe incorrect'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-10 shadow-2xl border border-zinc-100 dark:border-zinc-800"
      >
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-black tracking-tighter">E-SHOP</Link>
          <h1 className="text-3xl font-bold mt-6 tracking-tight">Bon retour !</h1>
          <p className="text-zinc-500 mt-2">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide opacity-70">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide opacity-70">Mot de passe</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all dark:bg-zinc-100 dark:text-zinc-900 shadow-xl shadow-zinc-900/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500">
          Pas de compte ? <Link href="/auth/register" className="text-cyan-600 font-bold hover:underline">Inscrivez-vous</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <LoginForm />
    </Suspense>
  );
}
