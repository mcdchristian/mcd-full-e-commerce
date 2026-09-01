"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
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
/** `storage` only fires in other tabs, so same-tab writes announce themselves. */
const CART_UPDATED_EVENT = 'cart:updated';
const EMPTY_CART = '[]';

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

const parseCart = (raw: string): CartItem[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isStoredItem) : [];
  } catch {
    // Corrupt storage should not take the whole page down.
    return [];
  }
};

// localStorage is the source of truth. useSyncExternalStore subscribes React to
// it, which keeps hydration correct — the server and the first client render
// both see getServerSnapshot — without an effect writing state on mount.
const readCart = (): string => {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY) ?? EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
};

const readServerCart = (): string => EMPTY_CART;

const writeCart = (raw: string): void => {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, raw);
  } catch {
    // Private browsing or a full quota; this tab keeps working regardless.
  }

  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};

const subscribeToCart = (onStoreChange: () => void): (() => void) => {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(CART_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(CART_UPDATED_EVENT, onStoreChange);
  };
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Snapshots are the raw JSON: identical contents compare equal by value, so
  // getSnapshot stays stable without any caching of its own.
  const raw = useSyncExternalStore(subscribeToCart, readCart, readServerCart);
  const items = useMemo(() => parseCart(raw), [raw]);

  const { user } = useAuth();
  const previousUserId = useRef<string | null>(null);

  // Read the stored value rather than the rendered one, so two updates in the
  // same tick cannot lose each other.
  const mutate = useCallback((update: (current: CartItem[]) => CartItem[]) => {
    writeCart(JSON.stringify(update(parseCart(readCart()))));
  }, []);

  // Clear only when an account hands over to another one, or on sign-out.
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const previousId = previousUserId.current;
    previousUserId.current = currentUserId;

    if (previousId !== null && previousId !== currentUserId) {
      writeCart(EMPTY_CART);
    }
  }, [user]);

  const addToCart = useCallback(
    (product: CartProduct, quantity: number = 1) => {
      const amount = Math.max(1, Math.floor(quantity));

      mutate((prevItems) => {
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
    },
    [mutate]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      mutate((prevItems) => prevItems.filter((item) => item.id !== id));
    },
    [mutate]
  );

  const clearCart = useCallback(() => {
    mutate(() => []);
  }, [mutate]);

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
