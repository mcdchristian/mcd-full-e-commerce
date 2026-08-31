"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './authStore';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

/** The subset of a product the cart needs; `price` arrives as a DECIMAL string. */
export interface CartProduct {
  id: string;
  name: string;
  price: number | string;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = 'cart';

const toPrice = (value: number | string): number => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const isStoredItem = (value: unknown): value is CartItem => {
  const item = value as CartItem | null;
  return (
    !!item &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    Number.isFinite(item.price) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
};

const readStoredCart = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isStoredItem) : [];
  } catch {
    // Corrupt or unavailable storage should not take the whole page down.
    return [];
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const { user } = useAuth();
  const previousUserId = useRef<string | null>(null);

  // Read storage after mount rather than during render: seeding state from
  // localStorage would not match the markup Next rendered on the server.
  useEffect(() => {
    setItems(readStoredCart());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Private browsing or a full quota; the cart just stays in memory.
    }
  }, [items, isHydrated]);

  // Clear only when an account hands over to another one, or on sign-out. The
  // previous version keyed this on the whole `user` object, so it also fired on
  // mount and on sign-in, discarding the cart built before logging in.
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const previousId = previousUserId.current;
    previousUserId.current = currentUserId;

    if (previousId !== null && previousId !== currentUserId) {
      setItems([]);
    }
  }, [user]);

  const addToCart = useCallback((product: CartProduct, quantity: number = 1) => {
    const amount = Math.max(1, Math.floor(quantity));

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + amount } : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: toPrice(product.price),
          quantity: amount,
          imageUrl: product.imageUrl ?? '',
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
