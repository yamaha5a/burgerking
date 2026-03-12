export default function Content() {
  return (
    <div className="container-fluid py-3">
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Tổng đơn hàng</h6>
              <h3 className="card-title mb-2">1,248</h3>
              <p className="mb-0 small text-success">+12% so với hôm qua</p>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Doanh thu hôm nay</h6>
              <h3 className="card-title mb-2">32.5M₫</h3>
              <p className="mb-0 small text-success">+8% so với tuần trước</p>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Khách hàng mới</h6>
              <h3 className="card-title mb-2">57</h3>
              <p className="mb-0 small text-muted">Trong 24h gần nhất</p>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Sản phẩm sắp hết</h6>
              <h3 className="card-title mb-2">9</h3>
              <p className="mb-0 small text-danger">Cần nhập bổ sung</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Đơn hàng gần đây</h5>
              <button className="btn btn-sm btn-outline-primary">Xem tất cả</button>
            </div>
            <div className="card-body">
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
                    <tr>
                      <td>#ORD-1024</td>
                      <td>Nguyễn Văn A</td>
                      <td>12/03/2026</td>
                      <td>1.250.000₫</td>
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          Hoàn thành
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>#ORD-1023</td>
                      <td>Trần Thị B</td>
                      <td>12/03/2026</td>
                      <td>780.000₫</td>
                      <td>
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                          Đang xử lý
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>#ORD-1022</td>
                      <td>Lê Văn C</td>
                      <td>11/03/2026</td>
                      <td>2.150.000₫</td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                          Hủy
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">Hoạt động gần đây</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush small">
                <li className="list-group-item px-0">
                  <span className="fw-semibold">Bạn</span> đã cập nhật trạng thái
                  đơn hàng #ORD-1023
                  <div className="text-muted">5 phút trước</div>
                </li>
                <li className="list-group-item px-0">
                  <span className="fw-semibold">Hệ thống</span> đã gửi email xác
                  nhận cho khách hàng mới
                  <div className="text-muted">30 phút trước</div>
                </li>
                <li className="list-group-item px-0">
                  <span className="fw-semibold">Kho</span> báo cáo sản phẩm sắp
                  hết hàng
                  <div className="text-muted">1 giờ trước</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
