"use client";
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '../../../store/cartStore';
import toast from 'react-hot-toast';
import { Product } from '../../../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
  });

  const { addToCart } = useCart();

  if (isLoading) return <div className="p-20 text-center text-xl font-bold">Chargement...</div>;
  if (!product) return <div className="p-20 text-center text-red-500">Produit non trouvé</div>;

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} ajouté au panier !`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-800"
          >
            <Image 
              src={product.imageUrl || 'https://via.placeholder.com/400'} 
              alt={product.name} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </motion.div>

          <div className="flex flex-col justify-center">
            <span className="text-sm font-bold uppercase tracking-widest text-cyan-600">
              {product.category?.name || 'Général'}
            </span>
            <h1 className="mt-4 text-5xl font-black tracking-tight">{product.name}</h1>
            <p className="mt-6 text-xl text-zinc-500 leading-relaxed">
              {product.description}
            </p>
            
            <div className="mt-10 flex items-center justify-between border-y border-zinc-200 py-6 dark:border-zinc-800">
              <span className="text-4xl font-bold">{product.price} €</span>
              <span className={`text-sm font-medium ${(product.stock ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(product.stock ?? 0) > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}
              </span>
            </div>

            <button 
              onClick={handleAddToCart}
              className="mt-10 w-full rounded-2xl bg-zinc-900 py-5 text-lg font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-2xl"
            >
              Ajouter au Panier
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
