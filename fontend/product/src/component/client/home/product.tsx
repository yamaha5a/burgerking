import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
  status?: string;
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

const ProductSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatest = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/products/public/latest?limit=8");
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as Product[];
      setProducts(data);
    } catch (e) {
      setError("Không tải được sản phẩm mới nhất");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatest();
  }, []);

  return (
    <>
      {/* Fruits Shop Start */}
      <div className="container-fluid fruite py-5">
        <div className="container py-5">
          <div className="tab-class text-center">
            <div className="row g-4">
              <div className="col-lg-4 text-start">
                <h1>Our Organic Products</h1>
              </div>

              <div className="col-lg-8 text-end">
                <ul className="nav nav-pills d-inline-flex text-center mb-5">

                  <li className="nav-item">
                    <a
                      className="d-flex m-2 py-2 bg-light rounded-pill active"
                      data-bs-toggle="pill"
                      href="#tab-1"
                    >
                      <span className="text-dark" style={{ width: "130px" }}>
                        All Products
                      </span>
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      className="d-flex py-2 m-2 bg-light rounded-pill"
                      data-bs-toggle="pill"
                      href="#tab-2"
                    >
                      <span className="text-dark" style={{ width: "130px" }}>
                        Vegetables
                      </span>
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      className="d-flex m-2 py-2 bg-light rounded-pill"
                      data-bs-toggle="pill"
                      href="#tab-3"
                    >
                      <span className="text-dark" style={{ width: "130px" }}>
                        Fruits
                      </span>
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      className="d-flex m-2 py-2 bg-light rounded-pill"
                      data-bs-toggle="pill"
                      href="#tab-4"
                    >
                      <span className="text-dark" style={{ width: "130px" }}>
                        Bread
                      </span>
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      className="d-flex m-2 py-2 bg-light rounded-pill"
                      data-bs-toggle="pill"
                      href="#tab-5"
                    >
                      <span className="text-dark" style={{ width: "130px" }}>
                        Meat
                      </span>
                    </a>
                  </li>

                </ul>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="tab-content">

              {/* TAB 1 */}
              <div id="tab-1" className="tab-pane fade show p-0 active">
                <div className="row g-4">
                  <div className="col-lg-12">
                    <div className="row g-4">

                      {loading && products.length === 0 ? (
                        <div className="text-center text-muted py-4">
                          Đang tải sản phẩm...
                        </div>
                      ) : error ? (
                        <div className="text-center text-danger py-4">{error}</div>
                      ) : products.length === 0 ? (
                        <div className="text-center text-muted py-4">
                          Chưa có sản phẩm nào.
                        </div>
                      ) : (
                        products.map((p) => (
                          <div key={p._id} className="col-md-6 col-lg-4 col-xl-3">
                            <div className="rounded position-relative fruite-item">
                              <div className="fruite-img">
                                <Link to={`/sanpham/${p._id}`}>
                                  <img
                                    src={p.image}
                                    className="img-fluid w-100 rounded-top"
                                    alt={p.name}
                                    style={{ height: 220, objectFit: "cover" }}
                                  />
                                </Link>
                              </div>

                              <div
                                className="text-white bg-secondary px-3 py-1 rounded position-absolute"
                                style={{ top: "10px", left: "10px" }}
                              >
                                {p.category}
                              </div>

                              <div className="p-4 border border-secondary border-top-0 rounded-bottom">
                                <h4 className="text-truncate">
                                  <Link to={`/sanpham/${p._id}`} className="text-dark text-decoration-none">
                                    {p.name}
                                  </Link>
                                </h4>
                                <p className="text-muted" style={{ minHeight: 48 }}>
                                  {p.description || "Sản phẩm mới nhất."}
                                </p>

                                <div className="d-flex justify-content-between flex-lg-wrap">
                                  <p className="text-dark fs-5 fw-bold mb-0">
                                    {formatMoney(p.price)}đ
                                  </p>

                                  <a
                                    href="#"
                                    className="btn border border-secondary rounded-pill px-3 text-primary"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    <i className="fa fa-shopping-bag me-2 text-primary"></i>
                                    Add to cart
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
      {/* Fruits Shop End */}
    </>
  )
}

export default ProductSection