import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  category: string;
  price: number;
  quantity: number;
  total: number;
}

interface CartResponse {
  items: CartItem[];
  subtotal: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  total: number;
  totalQuantity: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { clientToken } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const applyCartData = (data: CartResponse) => {
    setItems(data.items || []);
    setSubtotal(Number(data.subtotal || 0));
    setTotal(Number(data.total || 0));
  };

  const refreshCart = async () => {
    if (!clientToken) {
      setItems([]);
      setSubtotal(0);
      setTotal(0);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${clientToken}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as CartResponse;
      applyCartData(data);
    } catch {
      setItems([]);
      setSubtotal(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientToken]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!clientToken) {
      return { success: false, message: "Vui lòng đăng nhập để thêm giỏ hàng" };
    }
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clientToken}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = (await res.json()) as CartResponse & { message?: string };
      if (!res.ok) {
        return { success: false, message: data.message || "Không thể thêm vào giỏ hàng" };
      }
      applyCartData(data);
      return { success: true };
    } catch {
      return { success: false, message: "Không thể kết nối máy chủ" };
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!clientToken) return;
    const res = await fetch("/api/cart/item", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${clientToken}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
    if (res.ok) {
      const data = (await res.json()) as CartResponse;
      applyCartData(data);
    }
  };

  const removeItem = async (productId: string) => {
    if (!clientToken) return;
    const res = await fetch(`/api/cart/item/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    if (res.ok) {
      const data = (await res.json()) as CartResponse;
      applyCartData(data);
    }
  };

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        total,
        totalQuantity,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải dùng trong CartProvider");
  return ctx;
};
