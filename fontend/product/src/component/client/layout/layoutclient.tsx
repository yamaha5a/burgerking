import Header from "../home/header"
import Footer from "../home/footer"
import { Outlet } from "react-router-dom"

const LayoutClient = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export default LayoutClient