import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || "Đăng nhập thất bại");
    }
  };

  if (authLoading) {
    return (
      <div className="login-page">
        <div className="spinner-border text-light" role="status" style={{ zIndex: 3 }}>
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }
  if (isAdmin) {
    navigate("/admin", { replace: true });
    return null;
  }

  return (
    <div className="login-page">
      <div className="login-bubbles">
        <div className="login-bubble" />
        <div className="login-bubble" />
        <div className="login-bubble" />
        <div className="login-bubble" />
        <div className="login-bubble" />
      </div>

      <div className="login-card">
        <div className="login-card-header">
          <div className="login-card-icon">
            <i className="bi bi-shield-lock-fill" />
          </div>
          <h1 className="login-card-title">Đăng nhập Admin</h1>
          <p className="login-card-subtitle">Subnautica · Quản trị hệ thống</p>
        </div>

        <div className="login-card-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="login-error" role="alert">
                <i className="bi bi-exclamation-circle-fill" />
                {error}
              </div>
            )}

            <div className="login-input-wrap">
              <label>Email</label>
              <div className="login-input-group">
                <span className="icon-wrap">
                  <i className="bi bi-envelope" />
                </span>
                <input
                  type="email"
                  placeholder="Nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-input-wrap">
              <label>Mật khẩu</label>
              <div className="login-input-group">
                <span className="icon-wrap">
                  <i className="bi bi-lock" />
                </span>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          <p className="login-demo">
            Tài khoản demo: <code>admin@gmail.com</code> / <code>admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
