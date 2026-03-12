import Header from "../home/header"
import Footer from "../home/footer"
import { Outlet } from "react-router-dom"
import "@fortawesome/fontawesome-free/css/all.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"

// Bootstrap
import "../style/css/bootstrap.css"

// Libraries
import "../style/lib/lightbox/css/lightbox.min.css"
import "../style/lib/owlcarousel/assets/owl.carousel.min.css"

// Template CSS (LUÔN CUỐI)
import "../style/css/style.css"

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