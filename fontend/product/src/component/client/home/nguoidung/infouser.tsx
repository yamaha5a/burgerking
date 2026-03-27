import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useNotification } from "../../../hook/hook";
import { useCart } from "../../../../context/CartContext";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  address?: string;
  phone?: string;
  voucher?: number;
}

interface BillItem {
  productId?: string;
  name: string;
  image: string;
  quantity: number;
  price?: number;
  total: number;
  hoan_hang?: {
    ly_do?: string;
    image?: string;
    ngay_gui?: string;
  };
}

interface Bill {
  _id: string;
  danh_sach_san_pham: BillItem[];
  tong_tien: number;
  dia_chi_giao_hang: string;
  phone: string;
  phuong_thuc_thanh_toan: "COD" | "BANKING";
  ghi_chu: string;
  ly_do_huy_user?: string;
  ly_do_huy_admin?: string;
  trang_thai: "chờ thanh toán" | "chờ vận chuyển" | "chờ nhận" | "cần đánh giá" | "trả hàng";
  createdAt: string;
}

type BillFilterStatus = "all" | Bill["trang_thai"];

type ReviewModalState = {
  billId: string;
  productId: string;
  productName: string;
} | null;

const statuses: Bill["trang_thai"][] = [
  "chờ thanh toán",
  "chờ vận chuyển",
  "chờ nhận",
  "cần đánh giá",
  "trả hàng",
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

const InfoUser = () => {
  const { clientUser, clientToken, setClientProfile } = useAuth();
  const { notify } = useNotification();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingBills, setLoadingBills] = useState(false);
  const initialStatus = (searchParams.get("status") || "all") as BillFilterStatus;
  const [activeStatus, setActiveStatus] = useState<BillFilterStatus>(
    initialStatus === "all" || statuses.includes(initialStatus as Bill["trang_thai"])
      ? initialStatus
      : "all"
  );
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "password">(
    initialTab === "profile" || initialTab === "password" || initialTab === "orders"
      ? initialTab
      : "orders"
  );
  const [profileMessage, setProfileMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
  });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelModalBill, setCancelModalBill] = useState<Bill | null>(null);
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [repeatBuyingId, setRepeatBuyingId] = useState<string | null>(null);
  const [detailBill, setDetailBill] = useState<Bill | null>(null);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [returnModal, setReturnModal] = useState<{
    billId: string;
    productId: string;
    productName: string;
  } | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnImageFile, setReturnImageFile] = useState<File | null>(null);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const [reviewModal, setReviewModal] = useState<ReviewModalState>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProfile = async () => {
    if (!clientToken) return;
    try {
      setLoadingProfile(true);
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${clientToken}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as UserProfile;
      setProfile(data);
      setProfileForm({
        username: data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchBills = async (status: BillFilterStatus) => {
    if (!clientToken) return;
    try {
      setLoadingBills(true);
      const params = new URLSearchParams();
      if (status !== "all") params.set("trang_thai", status);
      const query = params.toString();
      const res = await fetch(`/api/bills/my${query ? `?${query}` : ""}`, {
        headers: { Authorization: `Bearer ${clientToken}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as Bill[];
      setBills(data || []);
    } catch {
      setBills([]);
    } finally {
      setLoadingBills(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientToken]);

  useEffect(() => {
    fetchBills(activeStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientToken, activeStatus]);

  const displayProfile = useMemo(
    () => profile || clientUser,
    [profile, clientUser]
  );

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientToken) {
      setPasswordMessage("Vui lòng đăng nhập");
      return;
    }
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Vui lòng nhập đầy đủ thông tin mật khẩu");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }
    try {
      const res = await fetch("/api/users/me/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clientToken}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = (await res.json()) as { message?: string };
      setPasswordMessage(data.message || (res.ok ? "Đổi mật khẩu thành công" : "Đổi mật khẩu thất bại"));
      if (res.ok) {
        notify("success", data.message || "Đổi mật khẩu thành công");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        notify("error", data.message || "Đổi mật khẩu thất bại");
      }
    } catch {
      setPasswordMessage("Không thể kết nối máy chủ");
      notify("error", "Không thể kết nối máy chủ");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientToken) {
      setProfileMessage("Vui lòng đăng nhập");
      return;
    }
    try {
      setSavingProfile(true);
      setProfileMessage("");
      const formData = new FormData();
      formData.append("username", profileForm.username);
      formData.append("email", profileForm.email);
      formData.append("phone", profileForm.phone);
      formData.append("address", profileForm.address);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${clientToken}` },
        body: formData,
      });
      const data = (await res.json()) as { message?: string; user?: UserProfile };
      if (!res.ok || !data.user) {
        setProfileMessage(data.message || "Cập nhật thông tin thất bại");
        notify("error", data.message || "Cập nhật thông tin thất bại");
        return;
      }

      setProfile(data.user);
      setClientProfile(data.user);
      setAvatarFile(null);
      setProfileMessage(data.message || "Cập nhật thông tin thành công");
      notify("success", data.message || "Cập nhật thông tin thành công");
    } catch {
      setProfileMessage("Không thể kết nối máy chủ");
      notify("error", "Không thể kết nối máy chủ");
    } finally {
      setSavingProfile(false);
    }
  };

  const canCancelBill = (bill: Bill) => {
    if (bill.trang_thai !== "chờ thanh toán") return false;
    const diff = Date.now() - new Date(bill.createdAt).getTime();
    return diff <= 20 * 60 * 1000;
  };

  const cancelBill = async (billId: string, reason: string) => {
    if (!clientToken) return;
    if (!reason.trim()) {
      notify("error", "Vui lòng nhập lý do hủy đơn");
      return;
    }
    try {
      setSubmittingCancel(true);
      const res = await fetch(`/api/bills/my/${billId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clientToken}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        notify("error", data.message || "Không thể hủy đơn");
        return;
      }
      fetchBills(activeStatus);
      notify("success", data.message || "Hủy đơn thành công");
      setCancelReason("");
      setCancelModalBill(null);
    } catch {
      notify("error", "Không thể kết nối máy chủ");
    } finally {
      setSubmittingCancel(false);
    }
  };

  const reBuyProducts = async (bill: Bill) => {
    const validItems = bill.danh_sach_san_pham.filter((item) => item.productId);
    if (validItems.length === 0) {
      notify("error", "Không tìm thấy sản phẩm hợp lệ để mua lại");
      return;
    }
    try {
      setRepeatBuyingId(bill._id);
      for (const item of validItems) {
        const result = await addToCart(String(item.productId), Number(item.quantity || 1));
        if (!result.success) {
          notify("error", result.message || "Không thể thêm một số sản phẩm vào giỏ");
          return;
        }
      }
      notify("success", "Đã thêm lại sản phẩm vào giỏ hàng");
      window.location.href = "/don-hang";
    } finally {
      setRepeatBuyingId(null);
    }
  };

  const mergeBillIntoList = (updated: Bill) => {
    setBills((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
    setDetailBill((prev) => (prev && prev._id === updated._id ? updated : prev));
  };

  const submitReturnRequest = async () => {
    if (!clientToken || !returnModal) return;
    if (!returnReason.trim()) {
      notify("error", "Vui lòng nhập lý do hoàn hàng");
      return;
    }
    try {
      setSubmittingReturn(true);
      const fd = new FormData();
      fd.append("productId", returnModal.productId);
      fd.append("reason", returnReason.trim());
      if (returnImageFile) fd.append("image", returnImageFile);

      const res = await fetch(`/api/bills/my/${returnModal.billId}/return-item`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${clientToken}` },
        body: fd,
      });
      const data = (await res.json()) as { message?: string; bill?: Bill };
      if (!res.ok || !data.bill) {
        notify("error", data.message || "Không gửi được yêu cầu hoàn hàng");
        return;
      }
      notify("success", data.message || "Đã gửi yêu cầu hoàn hàng");
      mergeBillIntoList(data.bill);
      setReturnModal(null);
      setReturnReason("");
      setReturnImageFile(null);
    } catch {
      notify("error", "Không thể kết nối máy chủ");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const submitReview = async () => {
    if (!clientToken || !reviewModal) return;
    if (!reviewContent.trim()) {
      notify("error", "Vui lòng nhập nội dung đánh giá");
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clientToken}`,
        },
        body: JSON.stringify({
          productId: reviewModal.productId,
          rating: reviewRating,
          content: reviewContent.trim(),
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        notify("error", data.message || "Đánh giá thất bại");
        return;
      }
      notify("success", data.message || "Đánh giá thành công");
      setReviewModal(null);
      setReviewRating(5);
      setReviewContent("");
    } catch {
      notify("error", "Không thể kết nối máy chủ");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredBills = useMemo(() => {
    const keyword = filterKeyword.trim().toLowerCase();
    if (!keyword) return bills;
    return bills.filter((bill) => {
      const byId = bill._id.toLowerCase().includes(keyword);
      const byAddress = String(bill.dia_chi_giao_hang || "").toLowerCase().includes(keyword);
      const byProducts = (bill.danh_sach_san_pham || []).some((item) =>
        String(item.name || "").toLowerCase().includes(keyword)
      );
      return byId || byAddress || byProducts;
    });
  }, [bills, filterKeyword]);

  return (
    <>
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Thông tin cá nhân</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active text-white">Tài khoản</li>
        </ol>
      </div>

      <div className="container-fluid py-5">
        <div className="container py-5">
          {!clientUser ? (
            <div className="text-center text-muted py-4">Vui lòng đăng nhập để xem thông tin cá nhân.</div>
          ) : (
            <div className="row g-4 align-items-start">
              <div className="col-lg-3">
                <div className="bg-light rounded p-3">
                  <h5 className="mb-3">Tài khoản của tôi</h5>
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className={`btn text-start ${activeTab === "orders" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setActiveTab("orders")}
                    >
                      Đơn hàng
                    </button>
                    <button
                      type="button"
                      className={`btn text-start ${activeTab === "profile" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setActiveTab("profile")}
                    >
                      Thông tin cá nhân
                    </button>
                    <button
                      type="button"
                      className={`btn text-start ${activeTab === "password" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setActiveTab("password")}
                    >
                      Mật khẩu
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-9">
                {activeTab === "orders" ? (
                  <div className="bg-light rounded p-4">
                    <h4 className="mb-3">Thông tin đơn hàng</h4>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <button
                        type="button"
                        className={`btn btn-sm ${activeStatus === "all" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setActiveStatus("all")}
                      >
                        Tất cả
                      </button>
                      {statuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={`btn btn-sm ${activeStatus === status ? "btn-primary" : "btn-outline-primary"}`}
                          onClick={() => setActiveStatus(status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Lọc theo mã đơn, địa chỉ hoặc tên sản phẩm..."
                        value={filterKeyword}
                        onChange={(e) => setFilterKeyword(e.target.value)}
                      />
                    </div>

                    {loadingBills ? (
                      <div className="text-muted">Đang tải đơn hàng...</div>
                    ) : filteredBills.length === 0 ? (
                      <div className="text-muted">Không có đơn hàng ở trạng thái này.</div>
                    ) : (
                      filteredBills.map((bill) => (
                        <div key={bill._id} className="border rounded bg-white p-3 mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>Mã đơn: {bill._id}</strong>
                            <span className="badge bg-primary">{bill.trang_thai}</span>
                          </div>
                          <div className="small text-muted mb-2">
                            {new Date(bill.createdAt).toLocaleString("vi-VN")} | Thanh toán: {bill.phuong_thuc_thanh_toan}
                          </div>
                          <div className="small text-muted mb-2">
                            Giao đến: {bill.dia_chi_giao_hang} - {bill.phone}
                          </div>
                          {bill.ly_do_huy_user ? (
                            <div className="small text-danger mb-2">Lý do hủy (user): {bill.ly_do_huy_user}</div>
                          ) : null}
                          {bill.ly_do_huy_admin ? (
                            <div className="small text-danger mb-2">Lý do hủy (admin): {bill.ly_do_huy_admin}</div>
                          ) : null}
                          {bill.danh_sach_san_pham.map((item, idx) => (
                            <div key={`${bill._id}-${idx}`} className="d-flex justify-content-between small border-top pt-2 mt-2">
                              <span>{item.name} x{item.quantity}</span>
                              <span>{formatMoney(item.total)}đ</span>
                            </div>
                          ))}
                          <div className="d-flex justify-content-between border-top pt-2 mt-2">
                            <strong>Tổng tiền</strong>
                            <strong>{formatMoney(bill.tong_tien)}đ</strong>
                          </div>
                          <div className="text-end mt-3">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setDetailBill(bill)}
                            >
                              Chi tiết
                            </button>
                          </div>
                          {canCancelBill(bill) ? (
                            <div className="text-end mt-3">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  setCancelReason("");
                                  setCancelModalBill(bill);
                                }}
                              >
                                Hủy đơn hàng
                              </button>
                            </div>
                          ) : null}
                          {bill.trang_thai === "trả hàng" ? (
                            <div className="text-end mt-3">
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                disabled={repeatBuyingId === bill._id}
                                onClick={() => reBuyProducts(bill)}
                              >
                                {repeatBuyingId === bill._id ? "Đang thêm lại..." : "Mua lại"}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                ) : null}

                {activeTab === "profile" ? (
                  <div className="bg-light rounded p-4">
                    <h4 className="mb-3">Thông tin cá nhân</h4>
                    {loadingProfile ? (
                      <div className="text-muted">Đang tải...</div>
                    ) : (
                      <form onSubmit={handleUpdateProfile}>
                        <div className="row g-3">
                          <div className="col-md-12">
                            <label className="form-label">Avatar</label>
                            <input
                              type="file"
                              accept="image/*"
                              className="form-control"
                              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Tên</label>
                            <input
                              className="form-control"
                              value={profileForm.username}
                              onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">SĐT</label>
                            <input
                              className="form-control"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Vai trò</label>
                            <input className="form-control" value={displayProfile?.role || ""} readOnly />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label">Địa chỉ</label>
                            <input
                              className="form-control"
                              value={profileForm.address}
                              onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="btn border-secondary rounded-pill px-4 py-2 text-primary mt-3"
                          disabled={savingProfile}
                        >
                          {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                        {profileMessage ? <div className="small text-muted mt-2">{profileMessage}</div> : null}
                      </form>
                    )}
                  </div>
                ) : null}

                {activeTab === "password" ? (
                  <div className="bg-light rounded p-4">
                    <h4 className="mb-3">Đổi mật khẩu</h4>
                    <form onSubmit={handleChangePassword}>
                      <div className="mb-3">
                        <label className="form-label">Mật khẩu cũ</label>
                        <input
                          type="password"
                          className="form-control"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Mật khẩu mới</label>
                        <input
                          type="password"
                          className="form-control"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Xác nhận mật khẩu mới</label>
                        <input
                          type="password"
                          className="form-control"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="btn border-secondary rounded-pill px-4 py-2 text-primary">
                        Đổi mật khẩu
                      </button>
                      {passwordMessage ? <div className="small text-muted mt-2">{passwordMessage}</div> : null}
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
      {cancelModalBill ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0, 0, 0, 0.45)", zIndex: 1060 }}
        >
          <div className="bg-white rounded shadow p-4 w-100" style={{ maxWidth: 520 }}>
            <h5 className="mb-2">Xác nhận hủy đơn</h5>
            <p className="text-muted small mb-3">
              Bạn đang hủy đơn <strong>{cancelModalBill._id}</strong>. Vui lòng nhập nội dung hủy để gửi cho shop.
            </p>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Nhập nội dung hủy đơn..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setCancelModalBill(null);
                  setCancelReason("");
                }}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={submittingCancel}
                onClick={() => cancelBill(cancelModalBill._id, cancelReason)}
              >
                {submittingCancel ? "Đang gửi..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {returnModal ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0, 0, 0, 0.5)", zIndex: 1070 }}
        >
          <div className="bg-white rounded shadow p-4 w-100" style={{ maxWidth: 480 }}>
            <h5 className="mb-2">Hoàn hàng</h5>
            <p className="small text-muted mb-3">
              Sản phẩm: <strong>{returnModal.productName}</strong>
            </p>
            <div className="mb-3">
              <label className="form-label">Lý do hoàn hàng *</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Mô tả lý do (bắt buộc)..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Ảnh minh chứng (tùy chọn)</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setReturnImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setReturnModal(null);
                  setReturnReason("");
                  setReturnImageFile(null);
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-warning"
                disabled={submittingReturn}
                onClick={() => submitReturnRequest()}
              >
                {submittingReturn ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {detailBill ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0, 0, 0, 0.45)", zIndex: 1060 }}
        >
          <div className="bg-white rounded shadow p-4 w-100" style={{ maxWidth: 920, maxHeight: "95vh", overflow: "auto" }}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="mb-1">Chi tiết đơn hàng {detailBill._id}</h5>
                <div className="small text-muted">
                  {new Date(detailBill.createdAt).toLocaleString("vi-VN")} | {detailBill.phuong_thuc_thanh_toan}
                </div>
              </div>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setDetailBill(null)}>
                Đóng
              </button>
            </div>
            <div className="mb-3">
              <div><strong>Địa chỉ:</strong> {detailBill.dia_chi_giao_hang}</div>
              <div><strong>SĐT:</strong> {detailBill.phone}</div>
              <div><strong>Trạng thái:</strong> {detailBill.trang_thai}</div>
            </div>
            <div className="border rounded p-3">
              <div className="fw-semibold mb-3">Toàn bộ sản phẩm trong đơn</div>
              {detailBill.trang_thai === "cần đánh giá" ? (
                <div className="alert alert-light border small mb-3 py-2">
                  Bạn có thể gửi <strong>hoàn hàng</strong> cho từng sản phẩm (kèm ảnh minh chứng và lý do).
                </div>
              ) : null}
              {(detailBill.danh_sach_san_pham || []).map((item, idx) => (
                <div
                  key={`${detailBill._id}-${idx}`}
                  className="d-flex flex-wrap align-items-center gap-3 border-bottom py-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }}
                  />
                  <div className="flex-grow-1" style={{ minWidth: 200 }}>
                    <div className="fw-semibold">{item.name}</div>
                    <div className="small text-muted">
                      {formatMoney(Number(item.price || 0))}đ x {item.quantity}
                    </div>
                    {item.hoan_hang?.ngay_gui ? (
                      <div className="small mt-2">
                        <span className="badge bg-success">Đã gửi hoàn hàng</span>
                        {item.hoan_hang.ly_do ? (
                          <div className="text-muted mt-1">Lý do: {item.hoan_hang.ly_do}</div>
                        ) : null}
                        {item.hoan_hang.image ? (
                          <div className="mt-2">
                            <img
                              src={item.hoan_hang.image}
                              alt="Ảnh hoàn hàng"
                              style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, objectFit: "cover" }}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-end ms-auto">
                    <div className="fw-semibold mb-2">{formatMoney(item.total)}đ</div>
                    {detailBill.trang_thai === "cần đánh giá" && item.productId ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => {
                          setReviewModal({
                            billId: detailBill._id,
                            productId: String(item.productId),
                            productName: item.name,
                          });
                          setReviewRating(5);
                          setReviewContent("");
                        }}
                      >
                        Đánh giá
                      </button>
                    ) : null}
                    {detailBill.trang_thai === "cần đánh giá" &&
                    item.productId &&
                    !item.hoan_hang?.ngay_gui ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning"
                        onClick={() =>
                          setReturnModal({
                            billId: detailBill._id,
                            productId: String(item.productId),
                            productName: item.name,
                          })
                        }
                      >
                        Hoàn hàng
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-between pt-3">
                <strong>Tổng cộng</strong>
                <strong>{formatMoney(detailBill.tong_tien)}đ</strong>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {reviewModal ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: "rgba(0, 0, 0, 0.5)", zIndex: 1075 }}
        >
          <div className="bg-white rounded shadow p-4 w-100" style={{ maxWidth: 520 }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 className="mb-1">Đánh giá sản phẩm</h5>
                <div className="small text-muted">
                  <strong>{reviewModal.productName}</strong>
                </div>
              </div>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setReviewModal(null)}>
                Đóng
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">Số sao</label>
              <div className="d-flex gap-2 flex-wrap">
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = i + 1;
                  const active = val <= reviewRating;
                  return (
                    <button
                      key={val}
                      type="button"
                      className={`btn btn-sm ${active ? "btn-warning" : "btn-outline-warning"}`}
                      onClick={() => setReviewRating(val)}
                    >
                      {val} <i className="fa fa-star"></i>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Nội dung</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Nhập nội dung đánh giá..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setReviewModal(null)}>
                Hủy
              </button>
              <button type="button" className="btn btn-success" disabled={submittingReview} onClick={submitReview}>
                {submittingReview ? "Đang gửi..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default InfoUser