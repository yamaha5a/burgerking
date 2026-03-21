import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

const DetailSanpham = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
<>
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
                    </div>
                </div>
            </div>
        </div>
        )}
    </div>
</div>

</>
  )
}

export default DetailSanpham