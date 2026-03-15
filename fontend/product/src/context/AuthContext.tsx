import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  address?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "admin_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const { authApi } = await import("../api/authApi");
      const data = await authApi.login(email, password);

      if (!data.success) {
        return { success: false, message: data.message || "Đăng nhập thất bại" };
      }

      if (!data.user || data.user.role !== "admin") {
        return {
          success: false,
          message: "Bạn không có quyền truy cập. Chỉ admin mới được phép.",
        };
      }

      setUser(data.user);
      localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không thể kết nối máy chủ";
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng trong AuthProvider");
  return ctx;
}
