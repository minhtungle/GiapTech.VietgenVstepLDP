import { Link } from 'react-router-dom'
import { CONTACT, FOOTER_LINKS } from '../data/site.js'

export default function Footer() {
  return (
    <footer id="rs-footer" className="rs-footer">
      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-12 col-sm-12 footer-widget md-mb-50">
              <h4 className="widget-title">Khám Phá</h4>
              <ul className="site-map">
                {FOOTER_LINKS.explore.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-lg-3 col-md-12 col-sm-12 footer-widget md-mb-50">
              <h4 className="widget-title">Khóa Học</h4>
              <ul className="site-map">
                {FOOTER_LINKS.courses.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-lg-3 col-md-12 col-sm-12 footer-widget md-mb-50">
              <h4 className="widget-title">Cơ Sở</h4>
              <ul className="site-map">
                {FOOTER_LINKS.branches.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-lg-3 col-md-12 col-sm-12 footer-widget">
              <h4 className="widget-title">Liên Hệ</h4>
              <ul className="address-widget">
                <li>
                  <i className="flaticon-location" />
                  <div className="desc">{CONTACT.locations}</div>
                </li>
                <li>
                  <i className="flaticon-call" />
                  <div className="desc">
                    <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a>
                  </div>
                </li>
                <li>
                  <i className="flaticon-email" />
                  <div className="desc">
                    <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="row y-middle">
            <div className="col-lg-4 md-mb-20">
              <div className="footer-logo md-text-center">
                <Link to="/">
                  <img src="/assets/images/vstep/logo-horizontal-white.png" alt="VietGen" />
                </Link>
              </div>
            </div>
            <div className="col-lg-4 md-mb-20">
              <div className="copyright text-center md-text-start">
                <p>&copy; 2026 VIETGEN Language Education. All Rights Reserved.</p>
              </div>
            </div>
            <div className="col-lg-4 text-end md-text-start">
              <ul className="footer-social">
                <li>
                  <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">
                    <i className="fa fa-facebook" />
                  </a>
                </li>
                <li>
                  <a href="#/" onClick={(e) => e.preventDefault()}>
                    <i className="fa fa-youtube-play" />
                  </a>
                </li>
                <li>
                  <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                    <i className="fa fa-whatsapp" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
