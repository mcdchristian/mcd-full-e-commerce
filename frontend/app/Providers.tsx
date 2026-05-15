"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { AuthProvider } from '../store/authStore';
import { CartProvider } from '../store/cartStore';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // Dark mode logic
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const html = document.documentElement;
    if (prefersDark.matches) html.classList.add('dark');
    
    const listener = (e: MediaQueryListEvent) => {
      if (e.matches) html.classList.add('dark'); 
      else html.classList.remove('dark');
    };
    
    prefersDark.addEventListener('change', listener);
    return () => prefersDark.removeEventListener('change', listener);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
