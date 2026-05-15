"use client";
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import ProductCard, { Product } from '../components/ProductCard';
import { motion } from 'framer-motion';

export default function Home() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data.items;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] w-full overflow-hidden bg-zinc-900 flex items-center justify-center">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" 
              className="h-full w-full object-cover" 
              alt="Hero"
            />
          </div>
          
          <div className="container relative z-20 px-4 text-center sm:text-left">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl"
            >
              Le Futur du <br/> <span className="text-cyan-400">Shopping.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 max-w-xl text-lg text-zinc-300"
            >
              Découvrez une sélection premium de produits technologiques et lifestyle, 
              sélectionnés pour leur qualité exceptionnelle.
            </motion.p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="container mx-auto px-4 py-16">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Nouveautés</h2>
              <p className="mt-2 text-zinc-500">Nos produits les plus récents, juste pour vous.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200">
              <p className="text-red-500">Erreur lors du chargement des produits.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {products?.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-12 dark:border-zinc-800">
        <div className="container mx-auto px-4 text-center text-zinc-500">
          <p>&copy; 2026 E-SHOP Premium. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
