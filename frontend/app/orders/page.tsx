"use client";
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import api from '../../lib/api';
import { useAuth } from '../../store/authStore';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: number;
  quantity: number;
  priceAtPurchase: string;
}

interface Order {
  id: string;
  totalAmount: string;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
  OrderItems?: OrderItem[];
}

interface OrderPage {
  totalItems: number;
  items: Order[];
  totalPages: number;
  currentPage: number;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente de paiement',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  delivered: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const countArticles = (order: Order) =>
  (order.OrderItems ?? []).reduce((total, line) => total + line.quantity, 0);

export default function OrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Wait for the stored token to resolve; redirecting on the first render
  // would sign out a visitor who is in fact logged in.
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/auth/login?redirect=/orders');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const { data, isLoading, error } = useQuery<OrderPage>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
    enabled: isAuthenticated,
  });

  const orders = data?.items ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-16">
        <h1 className="mb-12 text-4xl font-black tracking-tight">Mes commandes</h1>

        {isAuthLoading || isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border-2 border-dashed border-zinc-200 py-24 text-center dark:border-zinc-800">
            <p className="text-red-500">Impossible de charger vos commandes.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-6 text-6xl">📦</div>
            <p className="mb-8 text-xl text-zinc-500">Vous n&apos;avez pas encore commandé.</p>
            <button
              onClick={() => router.push('/products')}
              className="rounded-2xl bg-zinc-900 px-8 py-4 font-bold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Découvrir nos produits
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.article
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      Commande du {formatDate(order.createdAt)}
                    </p>
                    <p className="mt-1 font-mono text-sm text-zinc-500">#{order.id.slice(0, 8)}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <p className="text-sm text-zinc-500">
                    {countArticles(order)} article{countArticles(order) > 1 ? 's' : ''}
                    <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
                    Livraison : {order.shippingAddress}
                  </p>
                  <p className="text-2xl font-black">{Number(order.totalAmount).toFixed(2)} €</p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
