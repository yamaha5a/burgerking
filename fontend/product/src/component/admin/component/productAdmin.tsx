import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAdminNotification } from "../../hook/hook";

type ProductStatus = "in_stock" | "out_of_stock" | "inactive";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description?: string;
  origin?: string;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductListResponse {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Category {
  _id: string;
  name: string;
  status: "active" | "inactive";
}

interface CategoryListResponse {
  data: Category[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type ProductFormState = {
  name: string;
  category: string;
  price: string;
  stock: string;
  imageFile: File | null;
  origin: string;
  status: ProductStatus;
  description: string;
};

const emptyForm: ProductFormState = {
  name: "",
  category: "",
  price: "",
  stock: "0",
  imageFile: null,
  origin: "",
  status: "in_stock",
  description: "",
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);

const statusLabel = (s: ProductStatus) => {
  switch (s) {
    case "in_stock":
      return "Còn hàng";
    case "out_of_stock":
      return "Hết hàng";
    case "inactive":
      return "Ngừng bán";
    default:
      return s;
  }
};

const statusBadgeClass = (s: ProductStatus) => {
  switch (s) {
    case "in_stock":
      return "badge text-bg-success";
    case "out_of_stock":
      return "badge text-bg-warning";
    case "inactive":
      return "badge text-bg-secondary";
    default:
      return "badge text-bg-secondary";
  }
};

const ProductAdmin = () => {
  const { token } = useAuth();
  const { notify } = useAdminNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const headers = useMemo(() => {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchCategories = async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "200");
      params.set("sort", "newest");
      const res = await fetch(`/api/categories?${params.toString()}`, { headers });
      if (!res.ok) throw new Error("Không thể tải danh mục");
      const data = (await res.json()) as CategoryListResponse;
      const active = (data.data || []).filter((c) => c.status === "active");
      setCategories(active);
    } catch (e) {
      // Không chặn UI; chỉ báo nhẹ
      notify("error", "Không tải được danh sách danh mục");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search.trim()) params.set("search", search.trim());
      params.set("sort", sort);

      const res = await fetch(`/api/products?${params.toString()}`, { headers });
      if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
      const data = (await res.json()) as ProductListResponse;
      setProducts(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setError("Không tải được danh sách sản phẩm");
      notify("error", "Không tải được danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const resetAndRefetch = () => {
    setSearch("");
    setSort("newest");
    setPage(1);
    fetchProducts();
  };

  const openCreate = () => {
    const firstCategory = categories[0]?.name || "";
    setForm({ ...emptyForm, category: firstCategory });
    setEditingProduct(null);
    setIsCreateOpen(true);
  };

  const closeCreateEdit = () => {
    setIsCreateOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setIsCreateOpen(true);
    setForm({
      name: p.name || "",
      category: p.category || "",
      price: String(p.price ?? ""),
      stock: String(p.stock ?? 0),
      imageFile: null,
      origin: p.origin || "",
      status: p.status || "in_stock",
      description: p.description || "",
    });
  };

  const openDetail = (p: Product) => setSelectedProduct(p);
  const closeDetail = () => setSelectedProduct(null);

  const openDelete = (p: Product) => setDeletingProduct(p);
  const closeDelete = () => setDeletingProduct(null);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const submitCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    const category = form.category.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    const origin = form.origin.trim();
    const status = form.status;
    const description = form.description;

    if (!name || !category || Number.isNaN(price)) {
      setError("Vui lòng nhập đủ Name, Category, Price");
      notify("error", "Vui lòng nhập đủ Name, Category, Price");
      return;
    }

    const isEdit = Boolean(editingProduct?._id);
    if (!isEdit && !form.imageFile) {
      setError("Vui lòng chọn hình ảnh sản phẩm");
      notify("error", "Vui lòng chọn hình ảnh sản phẩm");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = isEdit ? `/api/products/${editingProduct!._id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", String(price));
      formData.append("stock", String(Number.isNaN(stock) ? 0 : stock));
      formData.append("origin", origin);
      formData.append("status", status);
      formData.append("description", description);
      if (form.imageFile) formData.append("image", form.imageFile);

      const h: HeadersInit = {};
      if (token) h.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { method, headers: h, body: formData });

      if (!res.ok) {
        const msg = isEdit ? "Không thể cập nhật sản phẩm" : "Không thể tạo sản phẩm";
        throw new Error(msg);
      }

      closeCreateEdit();
      notify("success", isEdit ? "Cập nhật sản phẩm thành công" : "Thêm sản phẩm thành công");
      fetchProducts();
    } catch (err) {
      setError(editingProduct ? "Cập nhật sản phẩm thất bại" : "Tạo sản phẩm thất bại");
      notify("error", editingProduct ? "Cập nhật sản phẩm thất bại" : "Thêm sản phẩm thất bại");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProduct?._id) return;
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/products/${deletingProduct._id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Không thể xóa sản phẩm");

      closeDelete();
      notify("success", "Xóa sản phẩm thành công");
      fetchProducts();
    } catch (err) {
      setError("Xóa sản phẩm thất bại");
      notify("error", "Xóa sản phẩm thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Quản lý sản phẩm</h4>
          <p className="text-muted mb-0">
            Danh sách sản phẩm, tồn kho và trạng thái hiển thị.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Thêm sản phẩm
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
                placeholder="Tên, danh mục hoặc xuất xứ..."
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
          <h6 className="mb-0">Danh sách sản phẩm</h6>
          <small className="text-muted">
            Trang {page}/{totalPages}
          </small>
        </div>

        <div className="card-body">
          {loading && products.length === 0 ? (
            <div className="text-center text-muted py-4">Đang tải danh sách sản phẩm...</div>
          ) : products.length === 0 ? (
            <div className="text-center text-muted py-4">Không có sản phẩm nào.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Origin</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td style={{ width: 72 }}>
                        <div
                          className="rounded bg-light d-flex align-items-center justify-content-center"
                          style={{ width: 56, height: 56, overflow: "hidden" }}
                        >
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <span className="text-muted small">No image</span>
                          )}
                        </div>
                      </td>
                      <td className="fw-semibold">{p.name}</td>
                      <td>{p.category}</td>
                      <td>{formatMoney(p.price)}</td>
                      <td>{p.stock ?? 0}</td>
                      <td>{p.origin || "-"}</td>
                      <td>
                        <span className={statusBadgeClass(p.status)}>{statusLabel(p.status)}</span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openDetail(p)}
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => openEdit(p)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => openDelete(p)}
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
      {selectedProduct && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết sản phẩm</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeDetail}
                />
              </div>
              <div className="modal-body">
                <div className="d-flex gap-3">
                  <div
                    className="rounded bg-light"
                    style={{ width: 96, height: 96, overflow: "hidden" }}
                  >
                    {selectedProduct.image ? (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold fs-5">{selectedProduct.name}</div>
                    <div className="text-muted small">{selectedProduct.category}</div>
                    <div className="mt-2">
                      <span className={statusBadgeClass(selectedProduct.status)}>
                        {statusLabel(selectedProduct.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <dl className="row mb-0 mt-3">
                  <dt className="col-sm-4">Giá</dt>
                  <dd className="col-sm-8">{formatMoney(selectedProduct.price)}</dd>

                  <dt className="col-sm-4">Tồn kho</dt>
                  <dd className="col-sm-8">{selectedProduct.stock ?? 0}</dd>

                  <dt className="col-sm-4">Xuất xứ</dt>
                  <dd className="col-sm-8">{selectedProduct.origin || "Chưa cập nhật"}</dd>

                  <dt className="col-sm-4">Mô tả</dt>
                  <dd className="col-sm-8">{selectedProduct.description || "—"}</dd>

                  <dt className="col-sm-4">Ngày tạo</dt>
                  <dd className="col-sm-8">
                    {selectedProduct.createdAt
                      ? new Date(selectedProduct.createdAt).toLocaleString("vi-VN")
                      : "-"}
                  </dd>

                  <dt className="col-sm-4">Cập nhật</dt>
                  <dd className="col-sm-8">
                    {selectedProduct.updatedAt
                      ? new Date(selectedProduct.updatedAt).toLocaleString("vi-VN")
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
                  {editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
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
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        required
                      >
                        <option value="" disabled>
                          -- Chọn danh mục --
                        </option>
                        {categories.map((c) => (
                          <option key={c._id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Origin (Xuất xứ)</label>
                      <input
                        className="form-control"
                        value={form.origin}
                        onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                        placeholder="VD: Việt Nam, Thái Lan..."
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Price</label>
                      <input
                        type="number"
                        min={0}
                        className="form-control"
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Stock</label>
                      <input
                        type="number"
                        min={0}
                        className="form-control"
                        value={form.stock}
                        onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">
                        Hình ảnh {editingProduct && "(bỏ qua nếu không đổi)"}
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            imageFile:
                              e.target.files && e.target.files[0] ? e.target.files[0] : null,
                          }))
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, status: e.target.value as ProductStatus }))
                        }
                      >
                        <option value="in_stock">Còn hàng</option>
                        <option value="out_of_stock">Hết hàng</option>
                        <option value="inactive">Ngừng bán</option>
                      </select>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      />
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
                    {saving ? "Đang lưu..." : editingProduct ? "Cập nhật" : "Tạo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deletingProduct && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xóa sản phẩm</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeDelete}
                  disabled={saving}
                />
              </div>
              <div className="modal-body">
                Bạn chắc chắn muốn xóa sản phẩm{" "}
                <span className="fw-semibold">{deletingProduct.name}</span>?
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
                <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={saving}>
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

export default ProductAdmin;

