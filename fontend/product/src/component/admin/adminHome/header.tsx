import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

function formatNow(date: Date) {
  return date.toLocaleString("vi-VN", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function Header() {
  const [now, setNow] = useState<Date>(new Date());
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const timeString = formatNow(now);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const initial = user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white shadow-sm">
      <div>
        <h1 className="h5 mb-1">Bảng điều khiển</h1>
        <p className="mb-0 text-muted small">
          Quản lý hệ thống admin một cách trực quan và dễ dùng
        </p>
      </div>

      <div className="d-flex align-items-center gap-4">
        <div className="text-end me-2">
          <div className="small text-muted">Thời gian hiện tại</div>
          <div className="fw-semibold">{timeString}</div>
        </div>

        <div className="dropdown">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center border-0 shadow-sm"
            style={{ width: 40, height: 40, backgroundColor: "#f1f3f5" }}
            data-bs-toggle="dropdown"
            aria-expanded="false"
            title={user?.email}
          >
            <span className="fw-bold text-secondary">{initial}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0 py-2">
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2"
                onClick={() => {}}
              >
                <i className="bi bi-person" />
                Profile
              </button>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2"
                onClick={() => {}}
              >
                <i className="bi bi-cart-check" />
                Đơn hàng
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center gap-2 text-danger"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right" />
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
