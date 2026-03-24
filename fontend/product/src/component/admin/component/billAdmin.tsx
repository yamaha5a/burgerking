import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAdminNotification } from "../../hook/hook";

type BillStatus = "chờ thanh toán" | "chờ vận chuyển" | "chờ nhận" | "cần đánh giá" | "trả hàng";

interface BillItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  total: number;
}

interface Bill {
  _id: string;
  userId?: { username?: string; email?: string; phone?: string };
  danh_sach_san_pham: BillItem[];
  tong_tien: number;
  phuong_thuc_thanh_toan: "COD" | "BANKING";
  trang_thai: BillStatus;
  dia_chi_giao_hang: string;
  phone?: string;
  ly_do_huy_user?: string;
  ly_do_huy_admin?: string;
  createdAt: string;
}

const statuses: BillStatus[] = ["chờ thanh toán", "chờ vận chuyển", "chờ nhận", "cần đánh giá", "trả hàng"];
const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

const nextByCurrent: Record<BillStatus, BillStatus | null> = {
  "chờ thanh toán": "chờ vận chuyển",
  "chờ vận chuyển": "chờ nhận",
  "chờ nhận": "cần đánh giá",
  "cần đánh giá": null,
  "trả hàng": null,
};

const statusBadgeClass = (status: BillStatus) => {
  if (status === "chờ thanh toán") return "bg-warning text-dark";
  if (status === "chờ vận chuyển") return "bg-info text-dark";
  if (status === "chờ nhận") return "bg-primary";
  if (status === "cần đánh giá") return "bg-success";
  return "bg-danger";
};

const BillAdmin = () => {
  const { token } = useAuth();
  const { notify } = useAdminNotification();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"" | BillStatus>("");
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [detailBill, setDetailBill] = useState<Bill | null>(null);

  const headers = useMemo(() => {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("trang_thai", statusFilter);
      const res = await fetch(`/api/bills?${params.toString()}`, { headers });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as Bill[];
      setBills(data || []);
    } catch {
      setBills([]);
      notify("error", "Không tải được danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, token]);

  const changeStatus = async (id: string, currentStatus: BillStatus) => {
    const nextStatus = nextByCurrent[currentStatus];
    if (!nextStatus) {
      notify("info", "Đơn hàng này không có trạng thái tiếp theo");
      return;
    }

    try {
      const res = await fetch(`/api/bills/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ trang_thai: nextStatus }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        notify("error", data.message || "Không thể cập nhật trạng thái");
        return;
      }
      notify("success", "Cập nhật trạng thái thành công");
      fetchBills();
      setDetailBill((prev) => {
        if (!prev || prev._id !== id) return prev;
        return { ...prev, trang_thai: nextStatus };
      });
    } catch {
      notify("error", "Không thể kết nối máy chủ");
    }
  };

  const adminCancel = async (id: string) => {
    if (!cancelReason.trim()) {
      notify("error", "Vui lòng nhập lý do hủy");
      return;
    }
    try {
      const res = await fetch(`/api/bills/${id}/admin-cancel`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        notify("error", data.message || "Không thể hủy đơn");
        return;
      }
      notify("success", data.message || "Hủy đơn thành công");
      setCancelingId(null);
      setCancelReason("");
      fetchBills();
      if (detailBill?._id === id) {
        setDetailBill({ ...detailBill, trang_thai: "trả hàng", ly_do_huy_admin: cancelReason.trim() });
      }
    } catch {
      notify("error", "Không thể kết nối máy chủ");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="mb-1">Quản lý đơn hàng</h4>
          <p className="text-muted mb-0">Theo dõi đơn, xem chi tiết và cập nhật đúng luồng trạng thái.</p>
        </div>
        <div style={{ width: 280 }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | BillStatus)}
          >
            <option value="">Tất cả trạng thái</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-muted">Đang tải đơn hàng...</div>
          ) : bills.length === 0 ? (
            <div className="text-muted">Chưa có đơn hàng.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => {
                    return (
                      <tr key={bill._id}>
                        <td className="fw-semibold">{bill._id}</td>
                        <td>
                          <div className="fw-semibold">{bill.userId?.username || "-"}</div>
                          <div className="small text-muted">{bill.userId?.email || "-"}</div>
                        </td>
                        <td className="fw-semibold">{formatMoney(bill.tong_tien)}đ</td>
                        <td>{bill.phuong_thuc_thanh_toan}</td>
                        <td>{new Date(bill.createdAt).toLocaleString("vi-VN")}</td>
                        <td>
                          <span className={`badge ${statusBadgeClass(bill.trang_thai)}`}>{bill.trang_thai}</span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setDetailBill(bill)}
                            >
                              Chi tiết
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
        </div>
      </div>

      {detailBill ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 1060 }}
        >
          <div className="container h-100 d-flex align-items-center justify-content-center py-4">
            <div className="bg-white rounded shadow p-4 w-100" style={{ maxWidth: 980, maxHeight: "95vh", overflow: "auto" }}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="mb-1">Chi tiết đơn {detailBill._id}</h5>
                  <div className="small text-muted">
                    {new Date(detailBill.createdAt).toLocaleString("vi-VN")} - {detailBill.phuong_thuc_thanh_toan}
                  </div>
                </div>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDetailBill(null)}>
                  Đóng
                </button>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-8">
                  <div className="border rounded p-3 h-100">
                    <div className="fw-semibold mb-2">Thông tin giao hàng</div>
                    <div className="mb-1">
                      <strong>Name:</strong> {detailBill.userId?.username || "-"}
                    </div>
                    <div className="mb-1">
                      <strong>Email:</strong> {detailBill.userId?.email || "-"}
                    </div>
                    <div className="mb-1">
                      <strong>SĐT:</strong> {detailBill.phone || detailBill.userId?.phone || "-"}
                    </div>
                    <div className="small mt-2">
                      <strong>Địa chỉ:</strong> {detailBill.dia_chi_giao_hang}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="border rounded p-3 h-100">
                    <div className="fw-semibold mb-2">Trạng thái</div>
                    <span className={`badge ${statusBadgeClass(detailBill.trang_thai)} mb-2`}>{detailBill.trang_thai}</span>
                    <div className="small text-muted">
                      Luồng chuẩn: chờ thanh toán -&gt; chờ vận chuyển -&gt; chờ nhận -&gt; cần đánh giá
                    </div>
                  </div>
                </div>
              </div>

              {detailBill.ly_do_huy_user ? (
                <div className="alert alert-danger py-2">Lý do hủy (user): {detailBill.ly_do_huy_user}</div>
              ) : null}
              {detailBill.ly_do_huy_admin ? (
                <div className="alert alert-danger py-2">Lý do hủy (admin): {detailBill.ly_do_huy_admin}</div>
              ) : null}

              <div className="border rounded p-3">
                <div className="fw-semibold mb-3">Sản phẩm đã đặt</div>
                {detailBill.danh_sach_san_pham.length === 0 ? (
                  <div className="text-muted">Không có dữ liệu sản phẩm.</div>
                ) : (
                  detailBill.danh_sach_san_pham.map((item, idx) => (
                    <div key={`${detailBill._id}-${idx}`} className="d-flex gap-3 align-items-center py-2 border-bottom">
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{item.name}</div>
                        <div className="small text-muted">
                          {formatMoney(item.price)}đ x {item.quantity}
                        </div>
                      </div>
                      <div className="fw-semibold">{formatMoney(item.total)}đ</div>
                    </div>
                  ))
                )}
                <div className="d-flex justify-content-between pt-3">
                  <span className="fw-semibold">Tổng cộng</span>
                  <span className="fw-bold">{formatMoney(detailBill.tong_tien)}đ</span>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                {nextByCurrent[detailBill.trang_thai] ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => changeStatus(detailBill._id, detailBill.trang_thai)}
                  >
                    Chuyển trạng thái tiếp theo: {nextByCurrent[detailBill.trang_thai]}
                  </button>
                ) : null}

                {detailBill.trang_thai === "chờ thanh toán" ? (
                  cancelingId === detailBill._id ? (
                    <>
                      <input
                        className="form-control"
                        style={{ maxWidth: 280 }}
                        placeholder="Lý do hủy..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                      <button type="button" className="btn btn-danger" onClick={() => adminCancel(detailBill._id)}>
                        Hủy đơn
                      </button>
                    </>
                  ) : (
                    <button type="button" className="btn btn-outline-danger" onClick={() => setCancelingId(detailBill._id)}>
                      Hủy đơn
                    </button>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BillAdmin;