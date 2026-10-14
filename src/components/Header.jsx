import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CONTACT, NAV_ITEMS } from '../data/site.js'

/**
 * Thanh menu chính. Thay cho rsmenu-main.js của template jQuery:
 * menu con mở bằng hover trên desktop (CSS) và bằng chạm trên mobile (state).
 */
export default function Header({ onOpenLead }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const [sticky, setSticky] = useState(false)
  const location = useLocation()
  const headerRef = useRef(null)

  // Đổi trang thì đóng hết menu đang mở.
  useEffect(() => {
    setMobileOpen(false)
    setOpenSubmenu(null)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 120)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Khoá cuộn nền khi menu mobile đang mở.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const toggleSubmenu = (label) =>
    setOpenSubmenu((current) => (current === label ? null : label))

  return (
    <div className="full-width-header header-style1 home1-modifiy">
      <header id="rs-header" className="rs-header" ref={headerRef}>
        <div className="topbar-area dark-parimary-bg">
          <div className="container">
            <div className="row y-middle">
              <div className="col-md-7">
                <ul className="topbar-contact">
                  <li>
                    <i className="flaticon-email" />
                    <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  </li>
                  <li>
                    <i className="flaticon-location" />
                    {CONTACT.locations}
                  </li>
                </ul>
              </div>
              <div className="col-md-5 text-end">
                <ul className="topbar-right">
                  <li className="login-register">
                    <i className="fa fa-phone" />
                    Hotline: <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a>
                  </li>
                  <li className="btn-part">
                    <button type="button" className="apply-btn" onClick={onOpenLead}>
                      Đăng Ký Ngay
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className={`menu-area menu-sticky${sticky ? ' sticky' : ''}`}>
          <div className="container">
            <div className="row y-middle">
              <div className="col-lg-2 col-6">
                <div className="logo-cat-wrap">
                  <div className="logo-part">
                    <Link to="/">
                      <img src="/assets/images/vstep/logo-horizontal.png" alt="VietGen" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-lg-8 col-6 text-end">
                <div className="rs-menu-area">
                  <div className="main-menu">
                    <div className="mobile-menu">
                      <button
                        type="button"
                        className="rs-menu-toggle"
                        aria-label="Mở menu"
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((v) => !v)}
                      >
                        <i className={`fa ${mobileOpen ? 'fa-times' : 'fa-bars'}`} />
                      </button>
                    </div>

                    <nav className={`rs-menu${mobileOpen ? ' rs-menu-open' : ''}`}>
                      <ul className="nav-menu">
                        {NAV_ITEMS.map((item) => {
                          const hasChildren = Boolean(item.children?.length)
                          const classes = [
                            hasChildren ? 'menu-item-has-children' : '',
                            item.highlight ? 'vg-nav-highlight' : '',
                            openSubmenu === item.label ? 'vg-submenu-open' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')

                          return (
                            <li key={item.label} className={classes || undefined}>
                              <NavLink
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) => (isActive ? 'vg-active' : '')}
                                onClick={(e) => {
                                  // Trên mobile, chạm vào mục có menu con thì mở menu con
                                  // thay vì chuyển trang ngay.
                                  if (hasChildren && window.innerWidth < 992) {
                                    e.preventDefault()
                                    toggleSubmenu(item.label)
                                  }
                                }}
                              >
                                {item.label}
                              </NavLink>

                              {hasChildren && (
                                <ul className="sub-menu">
                                  {item.children.map((child) => (
                                    <li key={child.to}>
                                      <NavLink to={child.to}>{child.label}</NavLink>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>

              <div className="col-lg-2 text-end relative d-none d-lg-block">
                <div className="expand-btn-inner">
                  <ul>
                    <li>
                      <Link className="hidden-xs rs-search" to="/test" aria-label="Test trình độ">
                        <i className="flaticon-search" />
                      </Link>
                    </li>
                  </ul>
                  <span>
                    {/* Nút gạch ngang bên phải: bản gốc mở off-canvas, nay dẫn tới trang test. */}
                    <Link id="nav-expander" className="nav-expander style3" to="/test" aria-label="Test trình độ">
                      <span className="dot1" />
                      <span className="dot2" />
                      <span className="dot3" />
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
