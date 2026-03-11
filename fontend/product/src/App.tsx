import { Routes, Route } from "react-router-dom"
import LayoutClient from "./component/client/layout/layoutclient"
import Home from "./component/client/home/home"

function App() {
  return (
    <Routes>
      <Route path="/" element={<LayoutClient />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App