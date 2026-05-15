"use client";
import Navbar from '../../components/Navbar';
import { useCart } from '../../store/cartStore';
import { useAuth } from '../../store/authStore';
import api from '../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Image from 'next/image';

export default function CartPage() {
  const { items, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
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
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/cart');
      return;
    }

    try {
      const res = await api.post('/orders/checkout-session', { items });
      window.location.href = res.data.url;
    } catch (err) {
      alert('Erreur lors de l\'initialisation du paiement. Vérifiez vos clés Stripe dans le fichier .env');
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
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{item.name}</h3>
                          <p className="text-zinc-500">{item.price} € x {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black">{(item.price * item.quantity).toFixed(2)} €</p>
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
                        <span>{totalPrice.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between opacity-70">
                        <span>Livraison</span>
                        <span>Gratuite</span>
                      </div>
                      <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span>{totalPrice.toFixed(2)} €</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleCheckout}
                      className="w-full py-4 bg-cyan-500 text-white rounded-2xl font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
                    >
                      Passer à la caisse
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
