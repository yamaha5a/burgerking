import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/admin/login", { replace: true })
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <aside
      className="d-none d-md-flex flex-column bg-dark text-white p-3 border-end shadow-sm"
      style={{ width: 260, background: "linear-gradient(180deg, #020617 0%, #111827 35%, #020617 100%)" }}
    >
      <nav className="flex-grow-1">
        <h6 className="text-uppercase text-white-50 fw-semibold mb-3 small">
          Bảng điều khiển
        </h6>
        <ul className="nav nav-pills flex-column gap-1">
          <li className="nav-item">
            <button
              className={`nav-link text-start rounded-3 ${
                isActive("/admin") ? "bg-primary text-white" : "text-white-50"
              }`}
              onClick={() => navigate("/admin")}
            >
              Tổng quan
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-start rounded-3 ${
                isActive("/admin/bills") ? "bg-primary text-white" : "text-white-50"
              }`}
              onClick={() => navigate("/admin/bills")}
            >
              Đơn hàng
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link text-start text-white-50 rounded-3">
              Khách hàng
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link text-start text-white-50 rounded-3">
              Báo cáo
            </button>
          </li>
          <li className="nav-item mt-3">
            <h6 className="text-uppercase text-white-50 fw-semibold mb-2 small">
              Nội dung
            </h6>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-start rounded-3 ${
                isActive("/admin/users") ? "bg-primary text-white" : "text-white-50"
              }`}
              onClick={() => navigate("/admin/users")}
            >
              Quản lý người dùng
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-start rounded-3 ${
                isActive("/admin/categories") ? "bg-primary text-white" : "text-white-50"
              }`}
              onClick={() => navigate("/admin/categories")}
            >
              Quản lý danh mục
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-start rounded-3 ${
                isActive("/admin/products") ? "bg-primary text-white" : "text-white-50"
              }`}
              onClick={() => navigate("/admin/products")}
            >
              Quản lý sản phẩm
            </button>
          </li>
          <li className="nav-item mt-3">
            <button
              className={`nav-link text-start rounded-3 ${
                isActive("/admin/banners") ? "bg-primary text-white" : "text-white-50"
              }`}
              onClick={() => navigate("/admin/banners")}
            >
              Quản lý banner
            </button>
          </li>
          <li className="nav-item mt-2">
            <button className="nav-link text-start text-white-50 rounded-3">
              Cài đặt
            </button>
          </li>
        </ul>
      </nav>

      <div className="mt-4 pt-3 border-top border-secondary">
        <div className="small text-white-50 mb-2">{user?.username}</div>
        <button
          type="button"
          className="btn btn-outline-light btn-sm w-100 text-start"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
