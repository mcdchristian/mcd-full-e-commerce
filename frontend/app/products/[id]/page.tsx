"use client";
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import { useParams, useRouter } from 'next/navigation';
import ProductImage from '../../../components/ProductImage';
import { motion } from 'framer-motion';
import { useCart } from '../../../store/cartStore';
import toast from 'react-hot-toast';
import { Product } from '../../../components/ProductCard';
import axios from 'axios';
import { getApiErrorMessage } from '../../../lib/errors';

/** The page shell, so the header stays reachable in every state. */
function ProductShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-16">{children}</main>
    </div>
  );
}

const isNotFound = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

export default function ProductDetails() {
  const { id } = useParams();
  
  const router = useRouter();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
  });

  const { addToCart, items } = useCart();

  if (isLoading) {
    return (
      <ProductShell>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex flex-col justify-center gap-4">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </ProductShell>
    );
  }

  if (!product) {
    // A 404 means the product is gone; anything else is a transport failure,
    // and telling someone their product does not exist because the network
    // dropped sends them looking for the wrong problem.
    const isMissing = isNotFound(error);

    return (
      <ProductShell>
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 py-24 text-center dark:border-zinc-800">
          <div className="mb-6 text-6xl">{isMissing ? '🔍' : '⚠️'}</div>
          <h1 className="mb-2 text-2xl font-bold">
            {isMissing ? 'Produit introuvable' : 'Chargement impossible'}
          </h1>
          <p className="mb-8 max-w-md text-zinc-500">
            {isMissing
              ? "Ce produit n'existe plus ou l'adresse est incorrecte."
              : getApiErrorMessage(error, 'Réessayez dans un instant.')}
          </p>
          <button
            onClick={() => router.push('/products')}
            className="rounded-2xl bg-zinc-900 px-8 py-4 font-bold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Retour au catalogue
          </button>
        </div>
      </ProductShell>
    );
  }

  const quantityInCart = items.find((item) => item.id === product.id)?.quantity ?? 0;
  const stock = product.stock ?? Infinity;
  const canAdd = quantityInCart < stock;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (!canAdd) {
      toast.error(
        isOutOfStock ? 'Ce produit est en rupture de stock.' : 'Stock maximum atteint pour ce produit.'
      );
      return;
    }

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
            <ProductImage
              src={product.imageUrl}
              alt=""
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
              disabled={!canAdd}
              className="mt-10 w-full rounded-2xl bg-zinc-900 py-5 text-lg font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-2xl disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:shadow-none dark:disabled:bg-zinc-700"
            >
              {isOutOfStock ? 'Rupture de stock' : canAdd ? 'Ajouter au Panier' : 'Stock maximum atteint'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
