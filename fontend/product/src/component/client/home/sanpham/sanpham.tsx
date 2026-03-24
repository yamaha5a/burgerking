import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
}

interface ProductListResponse {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CategoryItem {
  _id: string;
  name: string;
  productCount: number;
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

const Sanpham = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<"newest" | "oldest" | "price_asc" | "price_desc">(
    "newest"
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("sort", sort);
      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await fetch(`/api/products/public?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as ProductListResponse;
      setProducts(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setError("Không tải được danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories/public");
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as CategoryItem[];
      setCategories(data || []);
    } catch (e) {
      // Không chặn màn hình nếu danh mục lỗi
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleAddToCart = async (productId: string) => {
    const result = await addToCart(productId, 1);
    if (!result.success && result.message) {
      window.alert(result.message);
    }
  };

  return (
    <>
    <div className="container-fluid page-header py-5">
  <h1 className="text-center text-white display-6">Shop</h1>
  <ol className="breadcrumb justify-content-center mb-0">
    <li className="breadcrumb-item"><a href="#">Home</a></li>
    <li className="breadcrumb-item"><a href="#">Pages</a></li>
    <li className="breadcrumb-item active text-white">Shop</li>
  </ol>
</div>
<div className="container-fluid fruite py-5">
  <div className="container py-5">
    <h1 className="mb-4">Fresh fruits shop</h1>
    <div className="row g-4">
      <div className="col-lg-12">

        {/* SEARCH + SORT */}
        <div className="row g-4">
          <div className="col-xl-3">
            <form className="input-group w-100 mx-auto d-flex" onSubmit={handleSearch}>
              <input
                type="search"
                className="form-control p-3"
                placeholder="Tìm theo tên, danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="input-group-text p-3 border-0">
                <i className="fa fa-search"></i>
              </button>
            </form>
          </div>

          <div className="col-6"></div>

          <div className="col-xl-3">
            <div className="bg-light ps-3 py-3 rounded d-flex justify-content-between mb-4">
              <label>Sắp xếp:</label>
              <select
                className="border-0 form-select-sm bg-light me-3"
                value={sort}
                onChange={(e) => {
                  setSort(
                    e.target.value as "newest" | "oldest" | "price_asc" | "price_desc"
                  );
                  setPage(1);
                }}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row g-4">

          {/* SIDEBAR */}
          <div className="col-lg-3">
            <div className="row g-4">

              {/* Categories */}
              <div className="col-lg-12">
                <div className="mb-3">
                  <h4>Categories</h4>
                  <ul className="list-unstyled fruite-categorie">
                    <li>
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none p-0 w-100 text-start"
                        onClick={() => {
                          setSelectedCategory("");
                          setPage(1);
                        }}
                      >
                        <div className="d-flex justify-content-between">
                          <span className={selectedCategory === "" ? "fw-semibold" : ""}>
                            Tất cả
                          </span>
                          <span>({categories.reduce((sum, c) => sum + c.productCount, 0)})</span>
                        </div>
                      </button>
                    </li>
                    {categories.map((c) => (
                      <li key={c._id}>
                        <button
                          type="button"
                          className="btn btn-link text-decoration-none p-0 w-100 text-start"
                          onClick={() => {
                            setSelectedCategory(c.name);
                            setPage(1);
                          }}
                        >
                          <div className="d-flex justify-content-between">
                            <span className={selectedCategory === c.name ? "fw-semibold" : ""}>
                              {c.name}
                            </span>
                            <span>({c.productCount})</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price */}
              <div className="col-lg-12">
                <div className="mb-3">
                  <h4 className="mb-2">Price</h4>
                  <input type="range" className="form-range w-100" min="0" max="500" />
                </div>
              </div>

            </div>
          </div>

          {/* PRODUCT LIST */}
          <div className="col-lg-9">
            <div className="row g-4 justify-content-center">
              {loading && products.length === 0 ? (
                <div className="text-center text-muted py-4">Đang tải sản phẩm...</div>
              ) : error ? (
                <div className="text-center text-danger py-4">{error}</div>
              ) : products.length === 0 ? (
                <div className="text-center text-muted py-4">Không có sản phẩm phù hợp.</div>
              ) : (
                products.map((p) => (
                  <div key={p._id} className="col-md-6 col-lg-6 col-xl-4">
                    <div className="rounded position-relative fruite-item h-100">
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
                        <h4 className="text-truncate">{p.name}</h4>
                        <p className="text-muted" style={{ minHeight: 48 }}>
                          {p.description || "Sản phẩm tươi ngon mỗi ngày."}
                        </p>

                        <div className="d-flex justify-content-between flex-lg-wrap">
                          <p className="text-dark fs-5 fw-bold mb-0">{formatMoney(p.price)}đ</p>

                          <button
                            type="button"
                            className="btn border border-secondary rounded-pill px-3 text-primary"
                            onClick={() => handleAddToCart(p._id)}
                          >
                            <i className="fa fa-shopping-bag me-2 text-primary"></i>
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div className="col-12 mt-4">
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => canPrev && setPage((p) => p - 1)}
                    disabled={!canPrev || loading}
                  >
                    Trước
                  </button>
                  <span className="small text-muted">
                    Trang {page}/{totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => canNext && setPage((p) => p + 1)}
                    disabled={!canNext || loading}
                  >
                    Sau
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
    </>
  )
}

export default Sanpham