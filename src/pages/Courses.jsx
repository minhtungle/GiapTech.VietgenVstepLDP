import { Link } from 'react-router-dom'

import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { useLeadPopup } from '../App.jsx'
import { pages, courses } from '../data/content.js'
import QuickSignup from '../components/QuickSignup.jsx'

const page = pages.course
const newsletter = page.sections.find((s) => s.name === 'Newsletter section') || {}

export default function Courses() {
  const openLead = useLeadPopup()

  return (
    <>
      <Seo title={page.title} description={page.description} />
      <Breadcrumbs title={page.breadcrumb?.h1} subText="Khóa Học" />

      {/* Popular Courses Section */}
      <div
        id="rs-popular-courses"
        className="rs-popular-courses style3 pt-100 pb-100 md-pt-70 md-pb-70"
      >
        <div className="container">
          <div className="row">
            {courses.map((course, idx) => (
              <div
                className={`col-lg-4 col-md-6 col-sm-6 ${idx < 3 ? 'mb-40' : 'md-mb-30'}`}
                key={course.id}
              >
                <div className="courses-item">
                  <div className="img-part">
                    <img src={course.image} alt={course.image_alt} />
                  </div>
                  <div className="content-part">
                    <span>
                      <Link className="categories" to="/khoa-hoc">
                        {course.category}
                      </Link>
                    </span>
                    <ul className="meta-part">
                      <li className="user">
                        <i className="fa fa-clock-o" /> {course.sessions}
                      </li>
                      <li>
                        <span className="price">{course.price_label}</span>
                      </li>
                    </ul>
                    <h3 className="title">
                      <Link to="/khoa-hoc/vstep-b1-cap-toc">{course.name}</Link>
                    </h3>
                    <div className="bottom-part">
                      <div className="info-meta">
                        <ul>
                          <li className="ratings">
                            <i className="fa fa-star" />
                            <i className="fa fa-star" />
                            <i className="fa fa-star" />
                            {course.rating_text}
                          </li>
                        </ul>
                      </div>
                      <div className="btn-part">
                        <Link to="/khoa-hoc/vstep-b1-cap-toc">
                          Xem Chi Tiết
                          <i className="flaticon-right-arrow" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter section */}
      <div className="rs-newsletter style1 mb--90 sm-mb-0 sm-pb-70">
        <div className="container">
          <div className="newsletter-wrap">
            <div className="row y-middle">
              <div className="col-lg-6 col-md-12 md-mb-30">
                <div className="content-part">
                  <div className="sec-title">
                    <div className="title-icon md-mb-15">
                      <img src={`/${newsletter.icon_image}`} alt="images" />
                    </div>
                    <h2 className="title mb-0 white-color">{newsletter.title}</h2>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <QuickSignup
                  placeholder="Nhập số điện thoại của bạn"
                  buttonText={newsletter.form?.button}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
