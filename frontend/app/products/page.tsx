"use client";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import ProductCard, { Product } from '../../components/ProductCard';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

/** Divides evenly into the 1, 2 and 4 column grids the catalogue uses. */
const PAGE_SIZE = 24;

interface ProductPage {
  totalItems: number;
  items: Product[];
  totalPages: number;
  currentPage: number;
}

function ProductCatalog() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const search = searchParams.get('search');
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const { data: productsData, isLoading } = useQuery<ProductPage>({
    queryKey: ['products', categoryId, search, page],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { categoryId, search, page, limit: PAGE_SIZE }
      });
      return res.data;
    },
    // Keep the previous page on screen while the next one loads, so paging
    // does not blink back to skeletons.
    placeholderData: (previous) => previous,
  });

  const totalPages = productsData?.totalPages ?? 0;
  const totalItems = productsData?.totalItems ?? 0;

  /** Preserve the active filters when moving between pages. */
  const hrefForPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));

    const query = params.toString();
    return query ? `/products?${query}` : '/products';
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              {search ? `Résultats pour "${search}"` : 'Tous les Produits'}
            </h1>
            {!isLoading && totalItems > 0 && (
              <p className="mt-2 text-zinc-500">
                {totalItems} produit{totalItems > 1 ? 's' : ''}
                {totalPages > 1 ? ` · page ${page} sur ${totalPages}` : ''}
              </p>
            )}
          </div>
          <div className="flex gap-4">
             {/* Filters could go here */}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {productsData?.items?.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {!isLoading && productsData?.items?.length === 0 && (
          <div className="text-center py-20 bg-zinc-50 rounded-3xl dark:bg-zinc-900/50">
            <p className="text-xl text-zinc-500">Aucun produit trouvé.</p>
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Pagination du catalogue" className="mt-16 flex items-center justify-center gap-4">
            {page > 1 ? (
              <Link
                href={hrefForPage(page - 1)}
                rel="prev"
                className="rounded-2xl border border-zinc-200 px-6 py-3 text-sm font-bold transition-all hover:border-cyan-500 hover:text-cyan-600 dark:border-zinc-800"
              >
                Précédent
              </Link>
            ) : (
              <span className="rounded-2xl border border-zinc-100 px-6 py-3 text-sm font-bold text-zinc-300 dark:border-zinc-900 dark:text-zinc-700">
                Précédent
              </span>
            )}

            <span aria-current="page" className="text-sm font-medium text-zinc-500">
              {page} / {totalPages}
            </span>

            {page < totalPages ? (
              <Link
                href={hrefForPage(page + 1)}
                rel="next"
                className="rounded-2xl border border-zinc-200 px-6 py-3 text-sm font-bold transition-all hover:border-cyan-500 hover:text-cyan-600 dark:border-zinc-800"
              >
                Suivant
              </Link>
            ) : (
              <span className="rounded-2xl border border-zinc-100 px-6 py-3 text-sm font-bold text-zinc-300 dark:border-zinc-900 dark:text-zinc-700">
                Suivant
              </span>
            )}
          </nav>
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
