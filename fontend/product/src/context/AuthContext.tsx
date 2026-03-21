import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

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
  // Admin auth
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAdmin: boolean;

  // Client auth
  clientUser: User | null;
  clientToken: string | null;
  clientLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  clientRegister: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  clientLogout: () => void;

  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "admin_auth";
const TOKEN_KEY = "admin_token";
const CLIENT_AUTH_KEY = "client_auth";
const CLIENT_TOKEN_KEY = "client_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [clientUser, setClientUser] = useState<User | null>(null);
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (saved && savedToken) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setToken(savedToken);
      } catch {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    const clientSaved = localStorage.getItem(CLIENT_AUTH_KEY);
    const clientSavedToken = localStorage.getItem(CLIENT_TOKEN_KEY);
    if (clientSaved && clientSavedToken) {
      try {
        const parsed = JSON.parse(clientSaved);
        setClientUser(parsed);
        setClientToken(clientSavedToken);
      } catch {
        localStorage.removeItem(CLIENT_AUTH_KEY);
        localStorage.removeItem(CLIENT_TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        user?: User;
        token?: string;
      };

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "Đăng nhập thất bại" };
      }

      if (!data.user || data.user.role !== "admin") {
        return {
          success: false,
          message: "Bạn không có quyền truy cập. Chỉ admin mới được phép.",
        };
      }

      if (!data.token) {
        return { success: false, message: "Thiếu token xác thực từ máy chủ" };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
      localStorage.setItem(TOKEN_KEY, data.token);
      return { success: true };
    } catch (err) {
      return { success: false, message: "Không thể kết nối máy chủ" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const isAdmin = user?.role === "admin";

  const clientLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        user?: User;
        token?: string;
      };
      if (!res.ok || !data.success || !data.user || !data.token) {
        return { success: false, message: data.message || "Đăng nhập thất bại" };
      }

      setClientUser(data.user);
      setClientToken(data.token);
      localStorage.setItem(CLIENT_AUTH_KEY, JSON.stringify(data.user));
      localStorage.setItem(CLIENT_TOKEN_KEY, data.token);
      return { success: true };
    } catch {
      return { success: false, message: "Không thể kết nối máy chủ" };
    }
  };

  const clientRegister = async (
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "Đăng ký thất bại" };
      }
      return { success: true, message: data.message || "Đăng ký thành công" };
    } catch {
      return { success: false, message: "Không thể kết nối máy chủ" };
    }
  };

  const clientLogout = () => {
    setClientUser(null);
    setClientToken(null);
    localStorage.removeItem(CLIENT_AUTH_KEY);
    localStorage.removeItem(CLIENT_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin,
        clientUser,
        clientToken,
        clientLogin,
        clientRegister,
        clientLogout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng trong AuthProvider");
  return ctx;
}
