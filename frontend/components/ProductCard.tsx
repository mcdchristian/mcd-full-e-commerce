"use client";
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '../store/cartStore';
import toast from 'react-hot-toast';

export interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  description?: string;
  stock?: number;
  category?: { name: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} ajouté au panier !`);
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-zinc-100 p-2 dark:bg-zinc-900 dark:border-zinc-800 transition-shadow hover:shadow-xl"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={product.imageUrl || 'https://via.placeholder.com/400'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        
        <div className="flex flex-col p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            {product.category?.name || 'Général'}
          </span>
          <h3 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {product.price} €
          </p>
        </div>
      </Link>
      
      <div className="px-4 pb-4">
        <button 
          onClick={handleAddToCart}
          className="w-full rounded-xl bg-cyan-600 py-3 text-sm font-bold text-white transition-all hover:bg-cyan-700 active:scale-95 shadow-lg shadow-cyan-500/20"
        >
          Ajouter au panier
        </button>
      </div>
    </motion.div>
  );
}
