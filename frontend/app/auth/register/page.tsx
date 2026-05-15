"use client";
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      router.push('/auth/login');
    } catch (err) {
      alert('Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-10 shadow-2xl border border-zinc-100 dark:border-zinc-800"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black tracking-tighter">E-SHOP</Link>
          <h1 className="text-3xl font-bold mt-6 tracking-tight">Rejoignez-nous</h1>
          <p className="text-zinc-500 mt-2">Créez votre compte en quelques secondes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wide opacity-60">Prénom</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wide opacity-60">Nom</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wide opacity-60">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wide opacity-60">Mot de passe</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button className="w-full py-4 mt-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all dark:bg-zinc-100 dark:text-zinc-900 shadow-xl">
            S'inscrire
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          Déjà un compte ? <Link href="/auth/login" className="text-cyan-600 font-bold hover:underline">Connectez-vous</Link>
        </p>
      </motion.div>
    </div>
  );
}
