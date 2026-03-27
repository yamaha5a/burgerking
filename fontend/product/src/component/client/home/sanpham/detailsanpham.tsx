import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";
import CenteredToast from "../CenteredToast";

interface ProductDetail {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
  origin?: string;
  stock?: number;
  status?: string;
  createdAt?: string;
}

interface ReviewUser {
  username?: string;
  avatar?: string;
}

interface ReviewItem {
  _id: string;
  userId: ReviewUser | string;
  productId: string;
  content: string;
  rating: number;
  createdAt: string;
}

interface ReviewListResponse {
  items: ReviewItem[];
  total: number;
  averageRating: number;
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

const DetailSanpham = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; variant?: "success" | "danger" }>({
    show: false,
    message: "",
    variant: "success",
  });
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewStats, setReviewStats] = useState<{ total: number; averageRating: number }>({
    total: 0,
    averageRating: 0,
  });

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/products/public/${id}`);
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as ProductDetail;
      setProduct(data);
    } catch (e) {
      setError("Không tải được chi tiết sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/reviews/product/${id}`);
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as ReviewListResponse;
      setReviews(data.items || []);
      setReviewStats({
        total: Number(data.total || 0),
        averageRating: Number(data.averageRating || 0),
      });
    } catch {
      setReviews([]);
      setReviewStats({ total: 0, averageRating: 0 });
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const result = await addToCart(product._id, 1);
    if (result.success) {
      setToast({ show: true, message: "Thêm giỏ hàng thành công", variant: "success" });
      return;
    }
    setToast({ show: true, message: result.message || "Không thể thêm vào giỏ hàng", variant: "danger" });
  };

  const handleBuyNow = async () => {
    if (!product) return;
    const result = await addToCart(product._id, 1);
    if (result.success) {
      window.location.href = "/don-hang";
      return;
    }
    setToast({ show: true, message: result.message || "Không thể đặt hàng", variant: "danger" });
  };

  const renderStars = (value: number) => {
    const v = Math.max(0, Math.min(5, Math.floor(value || 0)));
    return (
      <div className="d-flex mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <i
            key={i}
            className={`fa fa-star ${i < v ? "text-secondary" : ""}`}
            style={{ marginRight: 2 }}
          ></i>
        ))}
      </div>
    );
  };

  return (
<>
<CenteredToast
  show={toast.show}
  message={toast.message}
  variant={toast.variant}
  onClose={() => setToast((t) => ({ ...t, show: false }))}
/>
<div className="container-fluid page-header py-5">
  <h1 className="text-center text-white display-6">Shop Detail</h1>
  <ol className="breadcrumb justify-content-center mb-0">
    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
    <li className="breadcrumb-item"><Link to="/sanpham">Sản phẩm</Link></li>
    <li className="breadcrumb-item active text-white">Shop Detail</li>
  </ol>
</div>
<div className="container-fluid py-5 mt-5">
    <div className="container py-5">
        {loading ? (
          <div className="text-center text-muted py-5">Đang tải chi tiết sản phẩm...</div>
        ) : error ? (
          <div className="text-center text-danger py-5">{error}</div>
        ) : !product ? (
          <div className="text-center text-muted py-5">Không tìm thấy sản phẩm.</div>
        ) : (
        <div className="row g-4 mb-5">
            <div className="col-lg-8 col-xl-9">
                <div className="row g-4">
                    <div className="col-lg-6">
                        <div className="border rounded">
                            <img src={product.image} className="img-fluid rounded" alt={product.name} />
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <h4 className="fw-bold mb-3">{product.name}</h4>
                        <p className="mb-2">Category: {product.category}</p>
                        <p className="mb-2">Origin: {product.origin || "Đang cập nhật"}</p>
                        <p className="mb-3">Stock: {product.stock ?? 0}</p>
                        <h5 className="fw-bold mb-3">{formatMoney(product.price)}đ</h5>
                        <p className="mb-4">
                          {product.description || "Sản phẩm tươi ngon, chất lượng cao."}
                        </p>
                        <Link
                          to="/sanpham"
                          className="btn border border-secondary rounded-pill px-4 py-2 mb-4 text-primary"
                        >
                          Quay lại danh sách
                        </Link>
                        <button
                          type="button"
                          className="btn border border-secondary rounded-pill px-4 py-2 mb-4 text-primary ms-2"
                          onClick={handleAddToCart}
                        >
                          <i className="fa fa-shopping-bag me-2 text-primary"></i>
                          Add to cart
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary rounded-pill px-4 py-2 mb-4 ms-2"
                          onClick={handleBuyNow}
                        >
                          Mua ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
        )}
    </div>
</div>
<div className="col-lg-12">
    <nav>
        <div className="nav nav-tabs mb-3">
            <button
                className="nav-link active border-white border-bottom-0"
                type="button"
                role="tab"
                id="nav-mission-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-mission"
                aria-controls="nav-mission"
                aria-selected="true"
            >
                Reviews ({reviewStats.total}) - TB: {reviewStats.averageRating}
            </button>
        </div>
    </nav>

    <div className="tab-content mb-5">
        <div
            className="tab-pane active"
            id="nav-mission"
            role="tabpanel"
            aria-labelledby="nav-mission-tab"
        >
            <div className="d-flex justify-content-center">
              <div style={{ width: "100%", maxWidth: 920 }}>
                {reviews.length === 0 ? (
                  <div className="text-center text-muted py-4">Chưa có đánh giá nào.</div>
                ) : (
                  reviews.map((r) => {
                    const user = typeof r.userId === "string" ? undefined : r.userId;
                    const name = user?.username || "Người dùng";
                    const avatar = user?.avatar || "img/avatar.jpg";
                    return (
                      <div key={r._id} className="d-flex border rounded p-3 mb-3 bg-white">
                        <img
                          src={avatar}
                          className="img-fluid rounded-circle"
                          style={{ width: 64, height: 64, objectFit: "cover" }}
                          alt={name}
                        />
                        <div className="ms-3 flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start gap-2">
                            <div>
                              <div className="fw-semibold">{name}</div>
                              <div className="small text-muted">
                                {new Date(r.createdAt).toLocaleString("vi-VN")}
                              </div>
                            </div>
                            <div className="text-end">{renderStars(r.rating)}</div>
                          </div>
                          <div className="mt-2">{r.content}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
        </div>

        <div className="tab-pane" id="nav-vision" role="tabpanel">
            <p className="text-dark">
                Tempor erat elitr rebum at clita. Diam dolor diam ipsum et tempor sit. Aliqu diam
                amet diam et eos labore. 3
            </p>
            <p className="mb-0">
                Diam dolor diam ipsum et tempor sit. Aliqu diam amet diam et eos labore.
                Clita erat ipsum et lorem et sit
            </p>
        </div>
    </div>
</div>
</>
  )
}

export default DetailSanpham