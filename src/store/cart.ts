export interface CartItem {
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
}

type Listener = () => void;
const STORAGE_KEY = "mitao.cart.v2";

function safeParse(json: string | null): CartItem[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as CartItem[];
  } catch {
    return [];
  }
}

function persist(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage issues in restricted environments.
  }
}

let _items: CartItem[] = safeParse(typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export const cartStore = {
  getItems: () => _items,
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  addItem: (item: CartItem) => {
    const existing = _items.find((i) => i.productId === item.productId && i.size === item.size && i.color === item.color);
    if (existing) {
      _items = _items.map((i) =>
        i.productId === item.productId && i.size === item.size && i.color === item.color
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      _items = [..._items, item];
    }
    persist(_items);
    notify();
  },
  removeItem: (productId: number) => {
    _items = _items.filter((i) => i.productId !== productId);
    persist(_items);
    notify();
  },
  updateQty: (productId: number, qty: number) => {
    if (qty <= 0) {
      _items = _items.filter((i) => i.productId !== productId);
    } else {
      _items = _items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i));
    }
    persist(_items);
    notify();
  },
  clearCart: () => {
    _items = [];
    persist(_items);
    notify();
  },
  totalItems: () => _items.reduce((s, i) => s + i.quantity, 0),
};
