import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../hook/hook";

type AdminStats = {
  totals: { users: number; products: number; bills: number; reviews: number };
  revenue: { today: number; month: number };
  lowStock: number;
  recentBills: { _id: string; createdAt: string; tong_tien: number; trang_thai: string; user: string }[];
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

export default function Content() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const fetchStats = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as AdminStats & { message?: string };
      if (!res.ok) {
        notify("error", data.message || "Không lấy được thống kê");
        setStats(null);
        return;
      }
      setStats(data);
    } catch {
      notify("error", "Không thể kết nối máy chủ");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">Tổng quan</h4>
          <div className="small text-muted">Thống kê hệ thống</div>
        </div>
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={fetchStats} disabled={loading}>
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Tổng đơn hàng</h6>
              <h3 className="card-title mb-0">{stats?.totals.bills ?? "-"}</h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Doanh thu hôm nay</h6>
              <h3 className="card-title mb-0">{stats ? `${formatMoney(stats.revenue.today)}₫` : "-"}</h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Người dùng</h6>
              <h3 className="card-title mb-0">{stats?.totals.users ?? "-"}</h3>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Bình luận</h6>
              <h3 className="card-title mb-0">{stats?.totals.reviews ?? "-"}</h3>
              <div className="small text-muted mt-1">Sắp hết hàng: {stats?.lowStock ?? "-"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-12">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Đơn hàng gần đây</h5>
            </div>
            <div className="card-body">
              {!stats ? (
                <div className="text-muted">{loading ? "Đang tải..." : "Chưa có dữ liệu"}</div>
              ) : stats.recentBills.length === 0 ? (
                <div className="text-muted">Chưa có đơn hàng.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Ngày</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentBills.map((b) => (
                        <tr key={b._id}>
                          <td>{b._id}</td>
                          <td>{b.user || "-"}</td>
                          <td>{new Date(b.createdAt).toLocaleString("vi-VN")}</td>
                          <td>{formatMoney(b.tong_tien)}₫</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                              {b.trang_thai}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
