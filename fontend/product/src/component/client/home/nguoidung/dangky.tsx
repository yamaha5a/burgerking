import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

const DangKy = () => {
  const { clientRegister } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);
    const result = await clientRegister(username, email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || "Đăng ký thất bại");
      return;
    }

    setSuccess("Đăng ký thành công. Bạn có thể đăng nhập ngay.");
    setTimeout(() => navigate("/dang-nhap"), 800);
  };

  return (
    <div className="container-fluid py-5 mt-5">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h3 className="mb-3">Đăng ký tài khoản</h3>
                <p className="text-muted mb-4">Tạo tài khoản để mua sắm nhanh hơn.</p>

                {error && <div className="alert alert-danger py-2">{error}</div>}
                {success && <div className="alert alert-success py-2">{success}</div>}

                <form onSubmit={onSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Tên hiển thị</label>
                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
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
                  <div className="mb-3">
                    <label className="form-label">Nhập lại mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                  </button>
                </form>

                <p className="small mt-3 mb-0">
                  Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangKy;
