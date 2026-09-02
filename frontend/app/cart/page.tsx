"use client";
import Navbar from '../../components/Navbar';
import { useCart } from '../../store/cartStore';
import { useAuth } from '../../store/authStore';
import api from '../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ProductImage from '../../components/ProductImage';
import { getApiErrorMessage } from '../../lib/errors';
import { formatPrice } from '../../lib/format';

function CartView() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';

  // Clear cart if payment is successful
  useEffect(() => {
    if (isSuccess && items.length > 0) {
      clearCart();
    }
  }, [isSuccess, clearCart, items.length]);

  const handleCheckout = async () => {
    // The session is still being restored from the stored token; bouncing to
    // the login page now would sign out a visitor who is already signed in.
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/cart');
      return;
    }

    setIsRedirecting(true);

    try {
      const res = await api.post('/orders/checkout-session', {
        // The server prices the order from its own catalogue, so it only needs
        // to know which products and how many of each.
        items: items.map(({ id, quantity }) => ({ id, quantity })),
      });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, "Impossible d'initialiser le paiement. Réessayez dans un instant.")
      );
      setIsRedirecting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-16">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 bg-emerald-50 rounded-3xl dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800"
            >
              <div className="text-7xl mb-6 text-center">🎉</div>
              <h2 className="text-3xl font-black text-emerald-900 dark:text-emerald-400 mb-2 text-center">Paiement Réussi !</h2>
              <p className="text-emerald-700/70 dark:text-emerald-500/70 mb-8 text-center max-w-md mx-auto">
                Merci pour votre confiance. Votre commande est en cours de préparation et vous recevrez un email de confirmation sous peu.
              </p>
              <button 
                onClick={() => router.push('/products')}
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                Continuer mes achats
              </button>
            </motion.div>
          ) : (
            <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-4xl font-black tracking-tight mb-12">Votre Panier ({totalItems})</h1>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-zinc-50 rounded-3xl dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                  <div className="text-6xl mb-6">🛒</div>
                  <p className="text-xl text-zinc-500 mb-8">Votre panier est vide.</p>
                  <button 
                    onClick={() => router.push('/products')} 
                    className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Découvrir nos produits
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-6">
                    {items.map((item) => (
                      <motion.div 
                        layout
                        key={item.id} 
                        className="flex items-center gap-6 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
                      >
                        <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-zinc-100">
                          <ProductImage src={item.imageUrl} alt="" sizes="96px" className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{item.name}</h3>
                          <p className="text-zinc-500">{formatPrice(item.price)} l&apos;unité</p>

                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex items-center rounded-full border border-zinc-200 dark:border-zinc-700">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label={`Retirer un ${item.name}`}
                                className="px-3 py-1 text-lg leading-none text-zinc-500 hover:text-cyan-600"
                              >
                                −
                              </button>
                              <span
                                aria-live="polite"
                                className="min-w-8 text-center text-sm font-bold tabular-nums"
                              >
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                                aria-label={`Ajouter un ${item.name}`}
                                className="px-3 py-1 text-lg leading-none text-zinc-500 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>

                            {item.stock !== undefined && item.quantity >= item.stock && (
                              <span className="text-xs font-medium text-amber-600">
                                Stock maximum
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black">{formatPrice(item.price * item.quantity)}</p>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-sm font-bold text-red-500 hover:underline mt-2"
                          >
                            Supprimer
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-zinc-900 text-white p-8 rounded-3xl h-fit sticky top-24 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6">Résumé</h2>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between opacity-70">
                        <span>Sous-total</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between opacity-70">
                        <span>Livraison</span>
                        <span>Gratuite</span>
                      </div>
                      <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleCheckout}
                      disabled={isRedirecting || isAuthLoading}
                      className="w-full py-4 bg-cyan-500 text-white rounded-2xl font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRedirecting ? 'Redirection...' : 'Passer à la caisse'}
                    </button>
                    <button 
                      onClick={clearCart}
                      className="w-full mt-4 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
                    >
                      Vider le panier
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// useSearchParams opts the subtree into client rendering, so Next requires a
// Suspense boundary above it before it can prerender this route.
function CartFallback() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="mb-12 h-12 w-72 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-64 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-800" />
      </main>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartFallback />}>
      <CartView />
    </Suspense>
  );
}
