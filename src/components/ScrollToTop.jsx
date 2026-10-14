import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/** Cuộn lên đầu khi đổi trang, kèm nút quay lại đầu trang. */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      id="scrollUp"
      className={visible ? 'vg-scroll-visible' : ''}
      aria-label="Lên đầu trang"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <i className="fa fa-angle-up" />
    </button>
  )
}
