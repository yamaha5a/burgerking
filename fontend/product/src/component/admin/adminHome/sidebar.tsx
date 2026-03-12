export default function Sidebar() {
  return (
    <aside
      className="d-none d-md-flex flex-column bg-dark text-white p-3 border-end"
      style={{ width: 260 }}
    >
      <div className="d-flex align-items-center mb-4">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center bg-primary me-2"
          style={{ width: 36, height: 36 }}
        >
          <span className="fw-bold">ADM</span>
        </div>
        <div>
          <div className="fw-semibold">Admin Panel</div>
          <div className="small text-white-50">Subnautica</div>
        </div>
      </div>

      <nav className="flex-grow-1">
        <ul className="nav nav-pills flex-column gap-1">
          <li className="nav-item">
            <button className="nav-link text-start text-white bg-primary">
              Tổng quan
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link text-start text-white-50">
              Đơn hàng
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link text-start text-white-50">
              Sản phẩm
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link text-start text-white-50">
              Khách hàng
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link text-start text-white-50">
              Báo cáo
            </button>
          </li>
          <li className="nav-item mt-3">
            <button className="nav-link text-start text-white-50">
              Cài đặt
            </button>
          </li>
        </ul>
      </nav>

      <div className="mt-4 pt-3 border-top border-secondary">
        <button className="btn btn-outline-light btn-sm w-100 text-start">
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
