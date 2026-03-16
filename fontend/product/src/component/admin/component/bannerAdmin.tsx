import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAdminNotification } from "../../hook/hook";

interface Banner {
  _id: string;
  id: number;
  image: string;
  text: string;
  font?: string;
  createdAt?: string;
}

const BannerAdmin = () => {
  const { token } = useAuth();
  const { notify } = useAdminNotification();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [text, setText] = useState("");
  const [font, setFont] = useState("Poppins");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/banners", {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Banner[] = await res.json();
      setBanners(data);
    } catch (err) {
      setError("Không tải được danh sách banner");
      notify("error", "Không tải được danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const resetForm = () => {
    setEditingBanner(null);
    setText("");
    setFont("Poppins");
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("text", text);
        formData.append("font", font);
        if (imageFile) {
          formData.append("image", imageFile);
        }

        const url = editingBanner
          ? `/api/banners/${editingBanner._id}`
          : "/api/banners";
        const method = editingBanner ? "PUT" : "POST";

        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(url, {
          method,
          body: formData,
          headers,
        });

        if (!res.ok) {
          throw new Error("Failed to save banner");
        }

        await loadBanners();
        resetForm();
        notify("success", editingBanner ? "Cập nhật banner thành công" : "Thêm banner thành công");
      } catch (err) {
        setError("Không lưu được banner, vui lòng thử lại");
        notify("error", "Không lưu được banner");
      } finally {
        setLoading(false);
      }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setText(banner.text);
    setFont(banner.font || "Poppins");
    setImageFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này?")) return;
    try {
      setLoading(true);
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete");
      await loadBanners();
      notify("success", "Xóa banner thành công");
    } catch {
      setError("Không xóa được banner");
      notify("error", "Không xóa được banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Quản lý banner</h4>
          <p className="text-muted mb-0">
            Thêm, chỉnh sửa và xóa banner hiển thị trên trang khách hàng.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2">
          {error}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">
                {editingBanner ? "Chỉnh sửa banner" : "Thêm banner mới"}
              </h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nội dung banner</label>
                  <input
                    type="text"
                    className="form-control"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nhập nội dung hiển thị..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Font chữ</label>
                  <select
                    className="form-select"
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                  >
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Hình ảnh {editingBanner && "(bỏ qua nếu không đổi)"}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(e.target.files && e.target.files[0]
                        ? e.target.files[0]
                        : null
                      )
                    }
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Đang lưu..."
                      : editingBanner
                      ? "Cập nhật"
                      : "Thêm mới"}
                  </button>
                  {editingBanner && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Danh sách banner</h6>
            </div>
            <div className="card-body">
              {loading && banners.length === 0 ? (
                <div className="text-center text-muted py-4">
                  Đang tải dữ liệu...
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center text-muted py-4">
                  Chưa có banner nào.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Hình ảnh</th>
                        <th>Nội dung</th>
                        <th>Font</th>
                        <th>Ngày tạo</th>
                        <th className="text-end">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners.map((banner) => (
                        <tr key={banner._id}>
                          <td style={{ width: 120 }}>
                            <img
                              src={banner.image}
                              alt={banner.text}
                              className="img-fluid rounded"
                              style={{ maxHeight: 70, objectFit: "cover" }}
                            />
                          </td>
                          <td>{banner.text}</td>
                          <td>{banner.font}</td>
                          <td>
                            {banner.createdAt
                              ? new Date(banner.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "-"}
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(banner)}
                            >
                              Sửa
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(banner._id)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerAdmin;