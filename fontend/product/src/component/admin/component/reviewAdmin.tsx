import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../hook/hook";

type ReviewRow = {
  _id: string;
  content: string;
  rating: number;
  isHidden?: boolean;
  createdAt: string;
  userId?: { username?: string; email?: string } | string;
  productId?: { name?: string; image?: string } | string;
};

type ReviewListResponse = {
  items: ReviewRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function ReviewAdmin() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReviewListResponse | null>(null);
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const fetchReviews = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      params.set("visibility", visibility);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/admin/reviews?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as ReviewListResponse & { message?: string };
      if (!res.ok) {
        notify("error", json.message || "Không lấy được bình luận");
        setData(null);
        return;
      }
      setData(json);
    } catch {
      notify("error", "Không thể kết nối máy chủ");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, visibility, page]);

  const rows = useMemo(() => data?.items || [], [data]);

  const toggleHidden = async (id: string, nextHidden: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isHidden: nextHidden }),
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) {
        notify("error", json.message || "Không cập nhật được bình luận");
        return;
      }
      notify("success", json.message || "Cập nhật thành công");
      fetchReviews();
    } catch {
      notify("error", "Không thể kết nối máy chủ");
    }
  };

  const deleteReview = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) {
        notify("error", json.message || "Không xóa được bình luận");
        return;
      }
      notify("success", json.message || "Đã xóa");
      fetchReviews();
    } catch {
      notify("error", "Không thể kết nối máy chủ");
    }
  };

  const totalPages = data?.totalPages || 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="container-fluid py-2">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 className="mb-0">Quản lý bình luận</h4>
          <div className="small text-muted">Ẩn/hiện hoặc xóa bình luận sản phẩm</div>
        </div>
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={fetchReviews} disabled={loading}>
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <div className="input-group">
            <input
              className="form-control"
              placeholder="Tìm theo nội dung bình luận..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setPage(1);
                fetchReviews();
              }}
              disabled={loading}
            >
              Tìm
            </button>
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={visibility}
            onChange={(e) => {
              setVisibility(e.target.value as "all" | "visible" | "hidden");
              setPage(1);
            }}
          >
            <option value="all">Tất cả</option>
            <option value="visible">Đang hiện</option>
            <option value="hidden">Đang ẩn</option>
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-center justify-content-md-end">
          <div className="small text-muted">Tổng: {data?.total ?? 0}</div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {!data ? (
            <div className="text-muted">{loading ? "Đang tải..." : "Chưa có dữ liệu"}</div>
          ) : rows.length === 0 ? (
            <div className="text-muted">Không có bình luận nào.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Người dùng</th>
                    <th>Sao</th>
                    <th>Nội dung</th>
                    <th>Ngày</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const product = typeof r.productId === "string" ? undefined : r.productId;
                    const user = typeof r.userId === "string" ? undefined : r.userId;
                    return (
                      <tr key={r._id}>
                        <td style={{ minWidth: 220 }}>
                          <div className="d-flex align-items-center gap-2">
                            {product?.image ? (
                              <img
                                src={product.image}
                                alt={product?.name || ""}
                                style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 8 }}
                              />
                            ) : null}
                            <div className="fw-semibold text-truncate" style={{ maxWidth: 220 }}>
                              {product?.name || "-"}
                            </div>
                          </div>
                        </td>
                        <td style={{ minWidth: 160 }}>
                          <div className="fw-semibold">{user?.username || "-"}</div>
                          <div className="small text-muted">{user?.email || ""}</div>
                        </td>
                        <td>{r.rating}</td>
                        <td style={{ minWidth: 320 }}>
                          <div className={`small ${r.isHidden ? "text-muted" : ""}`}>{r.content}</div>
                          {r.isHidden ? (
                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle mt-2">
                              Đang ẩn
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success-subtle mt-2">
                              Đang hiện
                            </span>
                          )}
                        </td>
                        <td>{new Date(r.createdAt).toLocaleString("vi-VN")}</td>
                        <td className="text-end" style={{ minWidth: 220 }}>
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className={`btn btn-sm ${r.isHidden ? "btn-outline-success" : "btn-outline-warning"}`}
                              onClick={() => toggleHidden(r._id, !r.isHidden)}
                            >
                              {r.isHidden ? "Hiện" : "Ẩn"}
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteReview(r._id)}>
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={!canPrev || loading}
              onClick={() => canPrev && setPage((p) => p - 1)}
            >
              Trước
            </button>
            <span className="small text-muted">
              Trang {page}/{totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={!canNext || loading}
              onClick={() => canNext && setPage((p) => p + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

