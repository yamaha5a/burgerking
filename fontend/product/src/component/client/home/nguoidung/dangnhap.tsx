import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

const DangNhap = () => {
  const { clientLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await clientLogin(email, password);
    setLoading(false);
    if (result.success) {
      navigate("/");
      return;
    }
    setError(result.message || "Đăng nhập thất bại");
  };

  return (
    <div className="container-fluid py-5 mt-5">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h3 className="mb-3">Đăng nhập</h3>
                <p className="text-muted mb-4">Đăng nhập để mua hàng và theo dõi đơn.</p>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <form onSubmit={onSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>
                </form>

                <p className="small mt-3 mb-0">
                  Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangNhap;
