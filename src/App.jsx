import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import LeadPopup from './components/LeadPopup.jsx'
import FloatingContact from './components/FloatingContact.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import CustomCursor from './components/CustomCursor.jsx'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Courses from './pages/Courses.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import Teachers from './pages/Teachers.jsx'
import TeacherDetail from './pages/TeacherDetail.jsx'
import Blog from './pages/Blog.jsx'
import BlogDetail from './pages/BlogDetail.jsx'
import Contact from './pages/Contact.jsx'
import PlacementTest from './pages/PlacementTest.jsx'
import NotFound from './pages/NotFound.jsx'

const LeadPopupContext = createContext(() => {})
export const useLeadPopup = () => useContext(LeadPopupContext)

const AUTO_OPEN_DELAY_MS = 2500

export default function App() {
  const [popupOpen, setPopupOpen] = useState(false)
  const location = useLocation()

  // Popup chỉ tự mở ở trang chủ. Các trang phụ vẫn mở được bằng nút CTA.
  useEffect(() => {
    if (location.pathname !== '/') return
    const timer = setTimeout(() => setPopupOpen(true), AUTO_OPEN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [location.pathname])

  const openPopup = () => setPopupOpen(true)

  return (
    <LeadPopupContext.Provider value={openPopup}>
      <ScrollToTop />
      <CustomCursor />
      <Header onOpenLead={openPopup} />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gioi-thieu" element={<About />} />
          <Route path="/khoa-hoc" element={<Courses />} />
          <Route path="/khoa-hoc/:slug" element={<CourseDetail />} />
          <Route path="/giang-vien" element={<Teachers />} />
          <Route path="/giang-vien/:slug" element={<TeacherDetail />} />
          <Route path="/tin-tuc" element={<Blog />} />
          <Route path="/tin-tuc/:slug" element={<BlogDetail />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/test" element={<PlacementTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
      <FloatingContact />
      <LeadPopup open={popupOpen} onClose={() => setPopupOpen(false)} />
    </LeadPopupContext.Provider>
  )
}
