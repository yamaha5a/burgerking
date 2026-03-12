import { Routes, Route } from "react-router-dom"

// Client
import LayoutClient from "./component/client/layout/layoutclient"
import Home from "./component/client/home/home"

// Admin
import AdminLayout from "./component/admin/layoutadmin/layoutadmin"
import Content from "./component/admin/adminHome/content"

function App() {
  return (
    <Routes>

      {/* CLIENT */}
      <Route path="/" element={<LayoutClient />}>
        <Route index element={<Home />} />
      </Route>

      {/* ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Content />} />
      </Route>

    </Routes>
  )
}

export default App