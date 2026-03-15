import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  address?: string;
  phone?: string;
  createdAt?: string;
}

interface UserListResponse {
  data: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const UserAdmin = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      params.set("sort", sort);

      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/users?${params.toString()}`, {
        headers,
      });

      if (!res.ok) {
        throw new Error("Không thể tải danh sách người dùng");
      }

      const data = (await res.json()) as UserListResponse;
      setUsers(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError("Không tải được danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleChangeSort = (value: "newest" | "oldest") => {
    setSort(value);
    setPage(1);
  };

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseDetail = () => {
    setSelectedUser(null);
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Quản lý người dùng</h4>
          <p className="text-muted mb-0">
            Danh sách tài khoản, thông tin liên hệ và trạng thái.
          </p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form
            className="row g-3 align-items-end"
            onSubmit={handleSearchSubmit}
          >
            <div className="col-md-4">
              <label className="form-label">Tìm kiếm</label>
              <input
                type="text"
                className="form-control"
                placeholder="Email, tên đăng nhập hoặc số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Sắp xếp</label>
              <select
                className="form-select"
                value={sort}
                onChange={(e) =>
                  handleChangeSort(e.target.value as "newest" | "oldest")
                }
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={loading}
              >
                Tìm kiếm
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                  fetchUsers();
                }}
                disabled={loading}
              >
                Đặt lại
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Danh sách người dùng</h6>
          <small className="text-muted">
            Trang {page}/{totalPages}
          </small>
        </div>
        <div className="card-body">
          {loading && users.length === 0 ? (
            <div className="text-center text-muted py-4">
              Đang tải danh sách người dùng...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-muted py-4">
              Không có người dùng nào.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Email</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <div
                              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                              style={{ width: 40, height: 40, overflow: "hidden" }}
                            >
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.username}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <span className="fw-semibold">
                                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="fw-semibold">{user.username}</div>
                            <div className="small text-muted">{user.role}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.phone || "-"}</td>
                      <td>{user.address || "-"}</td>
                      <td>{user.email}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleOpenDetail(user)}
                        >
                          Xem chi tiết
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled
                          title="Chức năng khóa tài khoản đang phát triển"
                        >
                          Khóa tài khoản
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            Trang {page} / {totalPages}
          </div>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={!canPrev || loading}
              onClick={() => canPrev && setPage((p) => p - 1)}
            >
              Trước
            </button>
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

      {/* Modal xem chi tiết */}
      {selectedUser && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết người dùng</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseDetail}
                />
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white me-3"
                    style={{ width: 56, height: 56, overflow: "hidden" }}
                  >
                    {selectedUser.avatar ? (
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.username}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span className="fw-semibold fs-4">
                        {selectedUser.username?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="fw-bold fs-5">{selectedUser.username}</div>
                    <div className="text-muted small">
                      Vai trò: {selectedUser.role}
                    </div>
                  </div>
                </div>

                <dl className="row mb-0">
                  <dt className="col-sm-4">Username</dt>
                  <dd className="col-sm-8">{selectedUser.username}</dd>

                  <dt className="col-sm-4">Email</dt>
                  <dd className="col-sm-8">{selectedUser.email}</dd>

                  <dt className="col-sm-4">Role</dt>
                  <dd className="col-sm-8">{selectedUser.role}</dd>

                  <dt className="col-sm-4">Số điện thoại</dt>
                  <dd className="col-sm-8">
                    {selectedUser.phone || "Chưa cập nhật"}
                  </dd>

                  <dt className="col-sm-4">Địa chỉ</dt>
                  <dd className="col-sm-8">
                    {selectedUser.address || "Chưa cập nhật"}
                  </dd>

                  <dt className="col-sm-4">Ngày tạo</dt>
                  <dd className="col-sm-8">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString(
                          "vi-VN"
                        )
                      : "-"}
                  </dd>

                  <dt className="col-sm-4">Khóa tài khoản</dt>
                  <dd className="col-sm-8">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      disabled
                    >
                      Khóa tài khoản (đang phát triển)
                    </button>
                  </dd>

                  <dt className="col-sm-4">Voucher</dt>
                  <dd className="col-sm-8 text-muted">
                    Đang phát triển
                  </dd>

                  <dt className="col-sm-4">Lịch sử đơn hàng</dt>
                  <dd className="col-sm-8 text-muted">
                    Đang phát triển
                  </dd>

                  <dt className="col-sm-4">Tổng số đơn hàng</dt>
                  <dd className="col-sm-8 text-muted">
                    Đang phát triển
                  </dd>
                </dl>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseDetail}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdmin;

