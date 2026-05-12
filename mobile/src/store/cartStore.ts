import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  name: string;
  nameHindi: string;
  unitPrice: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
};

type CartState = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQty: (productId: string, qty: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line) => {
        const qty = line.quantity ?? 1;
        const lines = get().lines;
        const i = lines.findIndex((l) => l.productId === line.productId);
        if (i >= 0) {
          const copy = [...lines];
          copy[i] = { ...copy[i], quantity: copy[i].quantity + qty };
          set({ lines: copy });
        } else {
          set({ lines: [...lines, { ...line, quantity: qty }] });
        }
      },
      setQty: (productId, qty) => {
        if (qty < 1) {
          set({ lines: get().lines.filter((l) => l.productId !== productId) });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.productId === productId ? { ...l, quantity: qty } : l,
          ),
        });
      },
      removeLine: (productId) =>
        set({ lines: get().lines.filter((l) => l.productId !== productId) }),
      clear: () => set({ lines: [] }),
    }),
    { name: "kumbh-cart-v1", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
