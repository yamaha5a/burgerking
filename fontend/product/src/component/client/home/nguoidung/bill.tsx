import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useCart } from "../../../../context/CartContext";
import addressData from "../../../../data/vietnam-address.json";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

const Bill = () => {
  const { clientUser, clientToken } = useAuth();
  const { items, total, refreshCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "paypal">("cod");

  const initialAddress = useMemo(() => {
    const parts = String(clientUser?.address || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      xa: parts[0] || "",
      tinh: parts[1] || "",
      diaChiCuThe: parts.slice(2).join(", ") || "",
    };
  }, [clientUser?.address]);

  const [formData, setFormData] = useState({
    name: clientUser?.username || "",
    xa: initialAddress.xa,
    tinh: initialAddress.tinh,
    diaChiCuThe: initialAddress.diaChiCuThe,
    phone: clientUser?.phone || "",
    email: clientUser?.email || "",
    note: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedProvince = useMemo(
    () => addressData.provinces.find((p) => p.name === formData.tinh),
    [formData.tinh]
  );

  const placeOrder = async () => {
    if (!clientUser || !clientToken) {
      setMessage("Vui lòng đăng nhập để đặt hàng");
      return;
    }
    if (!items.length) {
      setMessage("Giỏ hàng đang trống, không thể đặt hàng");
      return;
    }
    if (
      !formData.name.trim() ||
      !formData.xa.trim() ||
      !formData.tinh.trim() ||
      !formData.diaChiCuThe.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim()
    ) {
      setMessage("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clientToken}`,
        },
        body: JSON.stringify({
          customerInfo: formData,
          paymentMethod,
        }),
      });

      const data = (await res.json()) as { message?: string; orderId?: string };
      if (!res.ok) {
        setMessage(data.message || "Không thể đặt hàng");
        return;
      }

      setMessage(`Đặt hàng thành công. Mã đơn: ${data.orderId || ""}`);
      await refreshCart();
      const redirectStatus = encodeURIComponent("chờ thanh toán");
      setTimeout(() => navigate(`/thong-tin-ca-nhan?tab=orders&status=${redirectStatus}`), 900);
    } catch {
      setMessage("Không thể kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className="container-fluid page-header py-5">
  <h1 className="text-center text-white display-6">Checkout</h1>
  <ol className="breadcrumb justify-content-center mb-0">
    <li className="breadcrumb-item">
      <Link to="/">Home</Link>
    </li>
    <li className="breadcrumb-item">
      <Link to="/gio-hang">Cart</Link>
    </li>
    <li className="breadcrumb-item active text-white">
      Checkout
    </li>
  </ol>
</div>
<div className="container-fluid py-5">
  <div className="container py-5">
    <h1 className="mb-4">Chi tiết đơn hàng</h1>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        placeOrder();
      }}
    >
      <div className="row g-5">
        <div className="col-md-12 col-lg-6 col-xl-7">
          <div className="row">
            <div className="col-md-12 col-lg-6">
              <div className="form-item w-100">
                <label className="form-label my-3">
                  Name<sup></sup>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-item">
            <label className="form-label my-3">
              Tỉnh/Thành phố<sup></sup>
            </label>
            <select
              className="form-control"
              value={formData.tinh}
              onChange={(e) => {
                handleChange("tinh", e.target.value);
                handleChange("xa", "");
              }}
            >
              <option value="">Chọn tỉnh/thành</option>
              {addressData.provinces.map((province) => (
                <option key={province.name} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-item">
            <label className="form-label my-3">
              Xã/Phường<sup></sup>
            </label>
            <select
              className="form-control"
              value={formData.xa}
              onChange={(e) => handleChange("xa", e.target.value)}
              disabled={!selectedProvince}
            >
              <option value="">Chọn xã/phường</option>
              {(selectedProvince?.xa || []).map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>
          </div>

          <div className="form-item">
            <label className="form-label my-3">
              Địa chỉ cụ thể <sup></sup>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.diaChiCuThe}
              onChange={(e) => handleChange("diaChiCuThe", e.target.value)}
            />
          </div>

          <div className="form-item">
            <label className="form-label my-3">
              Số điện thoại<sup></sup>
            </label>
            <input
              type="tel"
              className="form-control"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <div className="form-item">
            <label className="form-label my-3">
              Địa chỉ email<sup></sup>
            </label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="form-check my-3"></div>

          <div className="form-item">
            <textarea
              name="text" 
              className="form-control"
              spellCheck={false}
              cols={30}
              rows={11}
              placeholder="Ghi chú (Tùy chọn)"
              value={formData.note}
              onChange={(e) => handleChange("note", e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="col-md-12 col-lg-6 col-xl-5">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Hình Ảnh</th>
                  <th scope="col">Tên </th>
                  <th scope="col">Giá</th>
                  <th scope="col">Số Lượng</th>
                  <th scope="col">Tổng Tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Chưa có sản phẩm trong giỏ hàng
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.productId}>
                      <th scope="row">
                        <div className="d-flex align-items-center mt-2">
                          <img
                            src={item.image}
                            className="img-fluid rounded-circle"
                            style={{ width: "90px", height: "90px", objectFit: "cover" }}
                            alt={item.name}
                          />
                        </div>
                      </th>
                      <td className="py-5">{item.name}</td>
                      <td className="py-5">{formatMoney(item.price)}đ</td>
                      <td className="py-5">{item.quantity}</td>
                      <td className="py-5">{formatMoney(item.total)}đ</td>
                    </tr>
                  ))
                )}
                <tr>
                  <td colSpan={3}></td>
                  <td className="py-4 fw-bold">Tổng Tiền</td>
                  <td className="py-4 fw-bold">{formatMoney(total)}đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
            <div className="col-12">
              <div className="form-check text-start my-3">
                <input
                  type="checkbox"
                  className="form-check-input bg-primary border-0"
                  id="Delivery-1"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <label className="form-check-label" htmlFor="Delivery-1">
                  Thanh toán khi nhận hàng
                </label>
              </div>
            </div>
          </div>

          <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
            <div className="col-12">
              <div className="form-check text-start my-3">
                <input
                  type="checkbox"
                  className="form-check-input bg-primary border-0"
                  id="Paypal-1"
                  name="payment"
                  checked={paymentMethod === "paypal"}
                  onChange={() => setPaymentMethod("paypal")}
                />
                <label className="form-check-label" htmlFor="Paypal-1">
                  Thanh toán qua ví điện tử
                </label>
              </div>
            </div>
          </div>


          <div className="row g-4 text-center align-items-center justify-content-center pt-4">
            <button
              type="submit"
              className="btn border-secondary py-3 px-4 text-uppercase w-100 text-primary"
              disabled={submitting || items.length === 0}
            >
              {submitting ? "Đang đặt hàng..." : "Place Order"}
            </button>
            {message ? <div className="small mt-3 text-center text-muted">{message}</div> : null}
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
    </>
  )
}

export default Bill