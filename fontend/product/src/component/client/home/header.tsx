import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";


function Header() {
  const { clientUser, clientLogout } = useAuth();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    clientLogout();
    setOpenUserMenu(false);
    navigate("/");
  };

  return (
    <div className="container-fluid fixed-top">
      <div className="container topbar bg-primary d-none d-lg-block">
        <div className="d-flex justify-content-between">
          <div className="top-info ps-2">
            <small className="me-3">
              <i className="fas fa-map-marker-alt me-2 text-secondary"></i>
              <a href="#" className="text-white">43Tam Trinh, Hà Nội</a>
            </small>
            <small className="me-3">
              <i className="fas fa-envelope me-2 text-secondary"></i>
              <a href="#" className="text-white">Mihato@mihato.com</a>
            </small>
          </div>

          <div className="top-link pe-2">
            <a href="#" className="text-white">
              <small className="text-white mx-2">Privacy Policy</small>/
            </a>
            <a href="#" className="text-white">
              <small className="text-white mx-2">Terms of Use</small>/
            </a>
            <a href="#" className="text-white">
              <small className="text-white ms-2">Sales and Refunds</small>
            </a>
          </div>
        </div>
      </div>

      <div className="container px-0">
        <nav className="navbar navbar-light bg-white navbar-expand-xl">
          <a href="index.html" className="navbar-brand">
            <h1 className="text-primary display-6">Fruitables</h1>
          </a>

          <button
            className="navbar-toggler py-2 px-3"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
          >
            <span className="fa fa-bars text-primary"></span>
          </button>

          <div className="collapse navbar-collapse bg-white" id="navbarCollapse">
            <div className="navbar-nav mx-auto">
              <Link to="/" className="nav-item nav-link active">Home</Link>
              <Link to="/sanpham" className="nav-item nav-link">Sản phẩm</Link>
              <div className="nav-item dropdown">
                <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                  Pages
                </a>

                <div className="dropdown-menu m-0 bg-secondary rounded-0">
                  <a href="cart.html" className="dropdown-item">Cart</a>
                  <a href="chackout.html" className="dropdown-item">Chackout</a>
                  <a href="testimonial.html" className="dropdown-item">Testimonial</a>
                  <a href="404.html" className="dropdown-item">404 Page</a>
                </div>
              </div>

              <a href="contact.html" className="nav-item nav-link">Contact</a>
            </div>

            <div className="d-flex m-3 me-0">
              <button
                className="btn-search btn border border-secondary btn-md-square rounded-circle bg-white me-4"
                data-bs-toggle="modal"
                data-bs-target="#searchModal"
              >
                <i className="fas fa-search text-primary"></i>
              </button>

              <a href="#" className="position-relative me-4 my-auto">
                <i className="fa fa-shopping-bag fa-2x"></i>
                <span
                  className="position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1"
                  style={{ top: "-5px", left: "15px", height: "20px", minWidth: "20px" }}
                >
                  3
                </span>
              </a>

              <div className="my-auto position-relative">
                <button
                  type="button"
                  className="btn p-0 border-0 bg-transparent"
                  onClick={() => setOpenUserMenu((v) => !v)}
                >
                  {clientUser ? (
                    clientUser.avatar ? (
                      <img
                        src={clientUser.avatar}
                        alt={clientUser.username}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle"
                        style={{ width: 36, height: 36, fontWeight: 700 }}
                      >
                        {clientUser.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )
                  ) : (
                    <i className="fas fa-user fa-2x"></i>
                  )}
                </button>

                {openUserMenu && (
                  <div
                    className="bg-white border rounded shadow-sm p-2"
                    style={{ position: "absolute", right: 0, top: 42, minWidth: 200, zIndex: 1050 }}
                  >
                    {!clientUser ? (
                      <>
                        <Link
                          to="/dang-nhap"
                          className="dropdown-item rounded"
                          onClick={() => setOpenUserMenu(false)}
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          to="/dang-ky"
                          className="dropdown-item rounded"
                          onClick={() => setOpenUserMenu(false)}
                        >
                          Đăng ký
                        </Link>
                        <Link
                          to="/admin/login"
                          className="dropdown-item rounded"
                          onClick={() => setOpenUserMenu(false)}
                        >
                          Đăng nhập admin
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="px-3 py-2 border-bottom">
                          <div className="fw-semibold">{clientUser.username}</div>
                          <div className="small text-muted">{clientUser.email}</div>
                        </div>
                        <button
                          type="button"
                          className="dropdown-item rounded mt-1"
                          onClick={() => setOpenUserMenu(false)}
                        >
                          Thông tin tài khoản
                        </button>
                        <button
                          type="button"
                          className="dropdown-item rounded text-danger"
                          onClick={handleLogout}
                        >
                          Đăng xuất
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Header;