import { Routes, Route, Navigate } from "react-router-dom"

// Client
import LayoutClient from "./component/client/layout/layoutclient"
import Home from "./component/client/home/home"

// Admin
import AdminLayout from "./component/admin/layoutadmin/layoutadmin"
import AdminProtectedRoute from "./component/admin/AdminProtectedRoute"
import AdminLogin from "./component/admin/adminLogin/AdminLogin"
import Content from "./component/admin/adminHome/content"
import BannerAdmin from "./component/admin/component/bannerAdmin"
import UserAdmin from "./component/admin/component/userAdmin"
import ProductAdmin from "./component/admin/component/productAdmin"
import CategoryAdmin from "./component/admin/component/categoryAdmin"
import BillAdmin from "./component/admin/component/billAdmin"
import Sanpham from "./component/client/home/sanpham/sanpham"
import DetailSanpham from "./component/client/home/sanpham/detailsanpham"
import DangNhap from "./component/client/home/nguoidung/dangnhap"
import DangKy from "./component/client/home/nguoidung/dangky"
import Cart from "./component/client/home/nguoidung/cart"
import Bill from "./component/client/home/nguoidung/bill"
import InfoUser from "./component/client/home/nguoidung/infouser"

function App() {
  return (
    <Routes>

      {/* CLIENT */}
      <Route path="/" element={<LayoutClient />}>
        <Route index element={<Home />} />
        <Route path="sanpham" element={<Sanpham />} />
        <Route path="sanpham/:id" element={<DetailSanpham />} />
        <Route path="dang-nhap" element={<DangNhap />} />
        <Route path="dang-ky" element={<DangKy />} />
        <Route path="gio-hang" element={<Cart />} />
        <Route path="don-hang" element={<Bill />} />
        <Route path="thong-tin-ca-nhan" element={<InfoUser />} />
      </Route>

      {/* ADMIN - Đăng nhập */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ADMIN - Protected: bắt buộc đăng nhập với role admin */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Content />} />
        <Route path="banners" element={<BannerAdmin />} />
        <Route path="users" element={<UserAdmin />} />
        <Route path="bills" element={<BillAdmin />} />
        <Route path="products" element={<ProductAdmin />} />
        <Route path="categories" element={<CategoryAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App