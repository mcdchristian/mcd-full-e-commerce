"use client";
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import ProductImage from '../../components/ProductImage';

interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/products/categories/all'); 
      return res.data;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-12">Catégories</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories?.map((category) => (
              <Link 
                key={category.id} 
                href={`/products?category=${category.id}`}
                className="group relative h-64 overflow-hidden rounded-3xl bg-zinc-900 shadow-xl"
              >
                <ProductImage
                  src={category.imageUrl}
                  alt=""
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <h3 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-2xl">{category.name}</h3>
                  <p className="text-zinc-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
