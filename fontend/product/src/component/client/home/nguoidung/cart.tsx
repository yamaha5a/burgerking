import { Link } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useCart } from "../../../../context/CartContext";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

const Cart = () => {
  const { clientUser } = useAuth();
  const { items, subtotal, total, loading, updateQuantity, removeItem } = useCart();

  const handleDecrease = async (productId: string, quantity: number) => {
    await updateQuantity(productId, quantity - 1);
  };

  const handleIncrease = async (productId: string, quantity: number) => {
    await updateQuantity(productId, quantity + 1);
  };

  return (
    <>
    <div className="container-fluid page-header py-5">
  <h1 className="text-center text-white display-6">Cart</h1>
  <ol className="breadcrumb justify-content-center mb-0">
    <li className="breadcrumb-item">
      <Link to="/">Home</Link>
    </li>
    <li className="breadcrumb-item">
      <Link to="/sanpham">Shop</Link>
    </li>
    <li className="breadcrumb-item active text-white">Cart</li>
  </ol>
</div>
<div className="container-fluid py-5">
  <div className="container py-5">
    {!clientUser ? (
      <div className="text-center text-muted py-5">
        Vui lòng đăng nhập để xem giỏ hàng.
      </div>
    ) : loading ? (
      <div className="text-center text-muted py-5">Đang tải giỏ hàng...</div>
    ) : (
      <>
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Hình Ảnh</th>
            <th scope="col">Tên Sản Phẩm</th>
            <th scope="col">Giá Sản Phẩm</th>
            <th scope="col">Số Lượng</th>
            <th scope="col">Tổng Tiền</th>
            <th scope="col">Xóa sản phẩm</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                Giỏ hàng của bạn đang trống.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.productId}>
                <th scope="row">
                  <div className="d-flex align-items-center">
                    <img
                      src={item.image}
                      className="img-fluid me-5 rounded-circle"
                      style={{ width: "80px", height: "80px", objectFit: "cover" }}
                      alt={item.name}
                    />
                  </div>
                </th>
                <td>
                  <p className="mb-0 mt-4">{item.name}</p>
                </td>
                <td>
                  <p className="mb-0 mt-4">{formatMoney(item.price)}đ</p>
                </td>
                <td>
                  <div className="input-group quantity mt-4" style={{ width: "100px" }}>
                    <div className="input-group-btn">
                      <button
                        className="btn btn-sm btn-minus rounded-circle bg-light border"
                        onClick={() => handleDecrease(item.productId, item.quantity)}
                      >
                        <i className="fa fa-minus"></i>
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-control form-control-sm text-center border-0"
                      value={item.quantity}
                      readOnly
                    />
                    <div className="input-group-btn">
                      <button
                        className="btn btn-sm btn-plus rounded-circle bg-light border"
                        onClick={() => handleIncrease(item.productId, item.quantity)}
                      >
                        <i className="fa fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="mb-0 mt-4">{formatMoney(item.total)}đ</p>
                </td>
                <td>
                  <button
                    className="btn btn-md rounded-circle bg-light border mt-4"
                    onClick={() => removeItem(item.productId)}
                  >
                    <i className="fa fa-times text-danger"></i>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    <div className="mt-5">
      <input type="text" className="border-0 border-bottom rounded me-5 py-3 mb-4" placeholder="Coupon Code" />
      <button className="btn border-secondary rounded-pill px-4 py-3 text-primary" type="button">
        Apply Coupon
      </button>
    </div>

    <div className="row g-4 justify-content-end">
      <div className="col-8"></div>
      <div className="col-sm-8 col-md-7 col-lg-6 col-xl-4">
        <div className="bg-light rounded">
          <div className="p-4">
            <h1 className="display-6 mb-4">
              Tổng <span className="fw-normal">Giỏ Hàng</span>
            </h1>
            <div className="d-flex justify-content-between mb-4">
              <h5 className="mb-0 me-4">Subtotal:</h5>
              <p className="mb-0">{formatMoney(subtotal)}đ</p>
            </div>
          </div>

          <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between">
            <h5 className="mb-0 ps-4 me-4">Tổng</h5>
            <p className="mb-0 pe-4">{formatMoney(total)}đ</p>
          </div>

          {items.length === 0 ? (
            <button
              className="btn border-secondary rounded-pill px-4 py-3 text-primary text-uppercase mb-4 ms-4"
              type="button"
              disabled
            >
              Proceed Checkout
            </button>
          ) : (
            <Link
              to="/don-hang"
              className="btn border-secondary rounded-pill px-4 py-3 text-primary text-uppercase mb-4 ms-4"
            >
              Tiến hành thanh toán

            </Link>
          )}
        </div>
      </div>
    </div>
    </>
    )}
  </div>
</div>
    </>
  )
}

export default Cart