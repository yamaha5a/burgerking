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

function App() {
  return (
    <Routes>

      {/* CLIENT */}
      <Route path="/" element={<LayoutClient />}>
        <Route index element={<Home />} />
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
        <Route path="products" element={<ProductAdmin />} />
        <Route path="categories" element={<CategoryAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App