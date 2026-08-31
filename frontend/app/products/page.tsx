"use client";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ProductCatalog() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const search = searchParams.get('search');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', categoryId, search],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { categoryId, search, limit: 100 }
      });
      return res.data;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-4xl font-black tracking-tight">
            {search ? `Résultats pour "${search}"` : 'Tous les Produits'}
          </h1>
          <div className="flex gap-4">
             {/* Filters could go here */}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {productsData?.items?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {!isLoading && productsData?.items?.length === 0 && (
          <div className="text-center py-20 bg-zinc-50 rounded-3xl dark:bg-zinc-900/50">
            <p className="text-xl text-zinc-500">Aucun produit trouvé.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// useSearchParams opts the subtree into client rendering, so Next requires a
// Suspense boundary above it before it can prerender this route.
function CatalogFallback() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="mb-12 h-12 w-72 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <ProductCatalog />
    </Suspense>
  );
}
