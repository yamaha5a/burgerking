import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAdminNotification } from "../../hook/hook";

type CategoryStatus = "active" | "inactive";

interface Category {
  _id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryListResponse {
  data: Category[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type CategoryFormState = {
  name: string;
  description: string;
  status: CategoryStatus;
};

const emptyForm: CategoryFormState = {
  name: "",
  description: "",
  status: "active",
};

const statusLabel = (s: CategoryStatus) => (s === "active" ? "Hoạt động" : "Tạm ẩn");
const statusBadgeClass = (s: CategoryStatus) =>
  s === "active" ? "badge text-bg-success" : "badge text-bg-secondary";

const CategoryAdmin = () => {
  const { token } = useAuth();
  const { notify } = useAdminNotification();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const headers = useMemo(() => {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      params.set("sort", sort);

      const res = await fetch(`/api/categories?${params.toString()}`, { headers });
      if (!res.ok) throw new Error("Không thể tải danh sách danh mục");
      const data = (await res.json()) as CategoryListResponse;
      setCategories(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setError("Không tải được danh sách danh mục");
      notify("error", "Không tải được danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCategories();
  };

  const resetAndRefetch = () => {
    setSearch("");
    setSort("newest");
    setPage(1);
    fetchCategories();
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingCategory(null);
    setIsCreateOpen(true);
  };

  const closeCreateEdit = () => {
    setIsCreateOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
  };

  const openEdit = (c: Category) => {
    setEditingCategory(c);
    setIsCreateOpen(true);
    setForm({
      name: c.name || "",
      description: c.description || "",
      status: c.status || "active",
    });
  };

  const openDetail = (c: Category) => setSelectedCategory(c);
  const closeDetail = () => setSelectedCategory(null);

  const openDelete = (c: Category) => setDeletingCategory(c);
  const closeDelete = () => setDeletingCategory(null);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const submitCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description,
      status: form.status,
    };

    if (!payload.name) {
      setError("Vui lòng nhập tên danh mục");
      notify("error", "Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const isEdit = Boolean(editingCategory?._id);
      const url = isEdit ? `/api/categories/${editingCategory!._id}` : "/api/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");

      closeCreateEdit();
      notify("success", isEdit ? "Cập nhật danh mục thành công" : "Thêm danh mục thành công");
      fetchCategories();
    } catch (err) {
      setError(editingCategory ? "Cập nhật danh mục thất bại" : "Tạo danh mục thất bại");
      notify("error", editingCategory ? "Cập nhật danh mục thất bại" : "Thêm danh mục thất bại");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory?._id) return;
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/categories/${deletingCategory._id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed");

      closeDelete();
      notify("success", "Xóa danh mục thành công");
      fetchCategories();
    } catch (err) {
      setError("Xóa danh mục thất bại");
      notify("error", "Xóa danh mục thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Quản lý danh mục</h4>
          <p className="text-muted mb-0">Thêm, chỉnh sửa và quản lý trạng thái danh mục.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Thêm danh mục
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form className="row g-3 align-items-end" onSubmit={handleSearchSubmit}>
            <div className="col-md-4">
              <label className="form-label">Tìm kiếm</label>
              <input
                type="text"
                className="form-control"
                placeholder="Tên hoặc mô tả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Sắp xếp</label>
              <select
                className="form-select"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as "newest" | "oldest");
                  setPage(1);
                }}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>

            <div className="col-md-5 d-flex align-items-end justify-content-end">
              <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                Tìm kiếm
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetAndRefetch}
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
          <h6 className="mb-0">Danh sách danh mục</h6>
          <small className="text-muted">
            Trang {page}/{totalPages}
          </small>
        </div>
        <div className="card-body">
          {loading && categories.length === 0 ? (
            <div className="text-center text-muted py-4">Đang tải danh mục...</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-muted py-4">Không có danh mục nào.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c._id}>
                      <td className="fw-semibold">{c.name}</td>
                      <td className="text-muted">{c.description || "-"}</td>
                      <td>
                        <span className={statusBadgeClass(c.status)}>{statusLabel(c.status)}</span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openDetail(c)}
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => openEdit(c)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => openDelete(c)}
                        >
                          Xóa
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

      {/* Modal chi tiết */}
      {selectedCategory && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết danh mục</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeDetail}
                />
              </div>
              <div className="modal-body">
                <dl className="row mb-0">
                  <dt className="col-sm-4">Tên</dt>
                  <dd className="col-sm-8">{selectedCategory.name}</dd>

                  <dt className="col-sm-4">Mô tả</dt>
                  <dd className="col-sm-8">{selectedCategory.description || "—"}</dd>

                  <dt className="col-sm-4">Trạng thái</dt>
                  <dd className="col-sm-8">{statusLabel(selectedCategory.status)}</dd>

                  <dt className="col-sm-4">Ngày tạo</dt>
                  <dd className="col-sm-8">
                    {selectedCategory.createdAt
                      ? new Date(selectedCategory.createdAt).toLocaleString("vi-VN")
                      : "-"}
                  </dd>

                  <dt className="col-sm-4">Cập nhật</dt>
                  <dd className="col-sm-8">
                    {selectedCategory.updatedAt
                      ? new Date(selectedCategory.updatedAt).toLocaleString("vi-VN")
                      : "-"}
                  </dd>
                </dl>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDetail}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm / sửa */}
      {isCreateOpen && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeCreateEdit}
                  disabled={saving}
                />
              </div>
              <form onSubmit={submitCreateOrEdit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, description: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, status: e.target.value as CategoryStatus }))
                        }
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Tạm ẩn</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={closeCreateEdit}
                    disabled={saving}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Đang lưu..." : editingCategory ? "Cập nhật" : "Tạo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deletingCategory && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xóa danh mục</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeDelete}
                  disabled={saving}
                />
              </div>
              <div className="modal-body">
                Bạn chắc chắn muốn xóa danh mục{" "}
                <span className="fw-semibold">{deletingCategory.name}</span>?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeDelete}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  disabled={saving}
                >
                  {saving ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryAdmin;

