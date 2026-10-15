import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

import Seo from '../components/Seo.jsx'
import { useLeadPopup } from '../App.jsx'
import { pages, courses, teachers, testimonials, schedule, partners } from '../data/content.js'

const page = pages.index
const sections = page.sections
const findSection = (name) => sections.find((s) => s.name === name) || {}

const banner = findSection('Banner Section')
const cert = findSection('Certificate Intro Section')
const about = findSection('About Section')
const categories = findSection('Categories Section')
const popularCourses = findSection('Popular Courses Section')
const formats = findSection('Training Format Section')
const roadmap = findSection('Quick Roadmap Section')
const cta = findSection('CTA Section')
const team = findSection('Team Section')
const testimonialSection = findSection('Testimonial Section')
const partnerSection = findSection('Partner (Đơn vị tổ chức thi VSTEP) Section')
const blogSection = findSection('Blog Section')
const newsletter = findSection('Newsletter section')

/** Tách chuỗi có \n thành các dòng ngăn bởi <br/>. */
function withLineBreaks(text) {
  if (!text) return null
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

// 3 khóa học nổi bật hiển thị ở trang chủ.
const featuredCourses = courses.filter((c) => c.appears_on?.includes('index'))
const indexTestimonials = testimonials.filter((t) => t.appears_on?.includes('index'))

export default function Home() {
  const openLead = useLeadPopup()

  return (
    <>
      <Seo title={page.title} description={page.description} />

      {/* Banner Section */}
      <div id="rs-banner" className="rs-banner style1">
        <div className="container">
          <div className="banner-content text-center">
            <h1 className="banner-title capitalize">{banner.h1}</h1>
            <div className="desc mb-35">{withLineBreaks(banner.desc_html_br)}</div>
            <div className="banner-btn">
              <button type="button" className="readon banner-style" onClick={openLead}>
                Đăng Ký
              </button>
              <Link className="readon banner-style vg-btn-outline" to="/test">
                Test Trình Độ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Giới thiệu + Lịch khai giảng, đặt ngay sau banner: khách vừa biết
          VietGen là ai, vừa thấy ngay lớp nào sắp mở để đăng ký. */}
      <div id="rs-about" className="vg-intro-schedule pt-80 pb-80 md-pt-55 md-pb-55">
        <div className="container">
          <div className="row">
            <div className="col-lg-7 md-mb-40">
              <div className="about-part">
                <div className="sec-title mb-30">
                  <div className="sub-title primary">{about.sub_title}</div>
                  <h2 className="title">{about.title}</h2>
                  <div className="desc">{about.desc}</div>
                </div>
                <div className="btn-part mt-25">
                  <Link className="readon" to="/gioi-thieu">
                    {about.buttons?.[0]?.text}
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="vg-schedule-box">
                <h3 className="vg-schedule-title">{about.notice_board?.title}</h3>
                <ul className="vg-schedule-list">
                  {schedule.map((item) => (
                    <li key={`${item.day}-${item.month}`}>
                      <div className="vg-schedule-date">
                        <span>{item.day}</span>
                        {item.month}
                      </div>
                      <div className="vg-schedule-desc">{item.desc}</div>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="readon banner-style vg-schedule-cta"
                  onClick={openLead}
                >
                  Đăng Ký Giữ Chỗ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Intro Section */}
      <div className="vg-cert-section pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="vg-cert-box">
            <div className="row align-items-center">
              <div className="col-lg-7 md-mb-40">
                <h2 className="vg-cert-title">{cert.title}</h2>
                <h4 className="vg-cert-subtitle">{cert.subtitle}</h4>
                <p className="vg-cert-desc">{cert.desc}</p>
                <h5 className="vg-cert-list-title">{cert.list_title}</h5>
                <ul className="vg-cert-list">
                  {cert.list?.map((item) => (
                    <li key={item.strong}>
                      <i className={cert.list_icon} /> <strong>{item.strong}</strong>
                      {item.rest}
                    </li>
                  ))}
                </ul>
                <ul className="vg-cert-list vg-cert-list-alt">
                  {cert.list_alt?.map((item) => (
                    <li key={item.strong}>
                      <i className={cert.list_icon} /> <strong>{item.strong}</strong>
                      {item.rest}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="readon banner-style uppercase"
                  onClick={openLead}
                >
                  {cert.buttons?.[0]?.text}
                </button>
              </div>
              <div className="col-lg-5">
                <div className="vg-cert-img">
                  <img src={cert.images?.[0]?.src} alt={cert.images?.[0]?.alt} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div
        id="rs-categories"
        className="rs-categories gray-bg style1 pt-94 pb-70 md-pt-64 md-pb-40"
      >
        <div className="container">
          <div className="row y-middle mb-50 md-mb-30">
            <div className="col-md-6 sm-mb-30">
              <div className="sec-title">
                <div className="sub-title primary">{categories.sub_title}</div>
                <h2 className="title mb-0">{categories.title}</h2>
              </div>
            </div>
            <div className="col-md-6">
              <div className="btn-part text-end sm-text-start">
                <button type="button" className="readon" onClick={openLead}>
                  {categories.buttons?.[0]?.text}
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            {categories.items?.map((item) => (
              <div className="col-lg-4 col-md-6 mb-30" key={item.title}>
                <Link className="categories-item" to="/khoa-hoc">
                  <div className="icon-part">
                    <img src={`/${item.icon}`} alt="" />
                  </div>
                  <div className="content-part">
                    <h4 className="title">{item.title}</h4>
                    <span className="courses">{item.courses}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Courses Section */}
      <div
        id="rs-popular-courses"
        className="rs-popular-courses bg6 style1 pt-94 pb-70 md-pt-64 md-pb-40"
      >
        <div className="container">
          <div className="row y-middle mb-50 md-mb-30">
            <div className="col-md-6 sm-mb-30">
              <div className="sec-title">
                <div className="sub-title primary">{popularCourses.sub_title}</div>
                <h2 className="title mb-0">{popularCourses.title}</h2>
              </div>
            </div>
            <div className="col-md-6">
              <div className="btn-part text-end sm-text-start">
                <Link to="/khoa-hoc" className="readon">
                  {popularCourses.buttons?.[0]?.text}
                </Link>
              </div>
            </div>
          </div>
          <div className="row">
            {featuredCourses.map((course) => (
              <div className="col-lg-4 col-md-6 mb-30" key={course.id}>
                <div className="courses-item">
                  <div className="img-part">
                    <img src={course.image} alt={course.image_alt} />
                  </div>
                  <div className="content-part">
                    <ul className="meta-part">
                      <li>
                        <span className="price">{course.price_label}</span>
                      </li>
                      <li>
                        <Link className="categorie" to="/khoa-hoc">
                          {course.category}
                        </Link>
                      </li>
                    </ul>
                    <h3 className="title">
                      <Link to="/khoa-hoc/vstep-b1-cap-toc">{course.name}</Link>
                    </h3>
                    <div className="bottom-part">
                      <div className="info-meta">
                        <ul>
                          <li className="user">
                            <i className="fa fa-clock-o" /> {course.sessions}
                          </li>
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

      {/* Training Format Section */}
      <div className="vg-format-section pt-100 pb-100 md-pt-70 md-pb-70 gray-bg">
        <div className="container">
          <div className="sec-title2 text-center mb-50 md-mb-30">
            <h2 className="title mb-16">
              Hình Thức <span style={{ color: '#0b0c51' }}>Đào Tạo</span>
            </h2>
            <div className="desc">
              Chất lượng thực tế, uy tín vững vàng và niềm tin từ đông đảo học viên đã trở thành
              động lực để VietGen không ngừng mở rộng các hình thức đào tạo, giúp học viên{' '}
              <strong>&quot;Học Trọng Tâm – Ôn Dễ Dàng – Thi Đỗ Tỷ Lệ Cao&quot;</strong>.
            </div>
          </div>
          <div className="row">
            {formats.items?.map((item, idx) => (
              <div
                className={`col-lg-4 col-md-6${idx < 2 ? ' md-mb-30' : ''}`}
                key={item.title}
              >
                <div className="vg-format-card">
                  <div
                    className="vg-format-img"
                    style={{ backgroundImage: `url('${item.bg_image}')` }}
                  >
                    <div className={`vg-format-overlay ${item.overlay_class}`}>
                      <h4>{withLineBreaks(item.overlay_title_html_br)}</h4>
                      <span>{item.overlay_sub}</span>
                    </div>
                  </div>
                  <div className="vg-format-body">
                    <h4 className="title">{item.title}</h4>
                    <p className="desc">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Roadmap Section */}
      <div className="vg-roadmap-section pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="sec-title2 text-center mb-50 md-mb-30">
            <h2 className="title mb-0">
              Quy Trình <span style={{ color: '#0b0c51' }}>Nhanh Chóng</span>
            </h2>
          </div>
          <div className="row">
            {roadmap.items?.map((item, idx) => (
              <div
                className={`col-lg-4 col-md-4${idx < 2 ? ' md-mb-30' : ''}`}
                key={item.number}
              >
                <div className="vg-roadmap-item text-center">
                  <div className="vg-roadmap-icon">
                    <i className={item.icon} />
                  </div>
                  <div className="vg-roadmap-card">
                    <span className="vg-roadmap-number">{item.number}</span>
                    <h4 className="title">{item.title}</h4>
                    <p className="desc">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rs-cta section-wrap gray-bg">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="img-part">
              <img src={cta.images?.[0]?.src} alt={cta.images?.[0]?.alt} />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="content">
              <div className="sec-title mb-40">
                <h2 className="title">{cta.title}</h2>
                <div className="desc">{cta.desc}</div>
              </div>
              <div className="btn-part">
                <button
                  type="button"
                  className="readon banner-style uppercase"
                  onClick={openLead}
                >
                  {cta.buttons?.[0]?.text}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div id="rs-team" className="rs-team style1 gray-bg pt-94 pb-100 md-pt-64 md-pb-70">
        <div className="container">
          <div className="row y-middle mb-50 md-mb-30">
            <div className="col-md-6 sm-mb-30">
              <div className="sec-title">
                <div className="sub-title primary">{team.sub_title}</div>
                <h2 className="title mb-0">{team.title}</h2>
              </div>
            </div>
            <div className="col-md-6">
              <div className="btn-part text-end sm-text-start">
                <Link to="/giang-vien" className="readon">
                  {team.buttons?.[0]?.text}
                </Link>
              </div>
            </div>
          </div>
          <Swiper
            modules={[Autoplay]}
            loop
            spaceBetween={30}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            speed={800}
            breakpoints={{
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              992: { slidesPerView: 4 },
            }}
          >
            {teachers.map((teacher) => (
              <SwiperSlide key={teacher.name}>
                <div className="team-item">
                  <img src={teacher.image} alt="" />
                  <div className="content-part">
                    <h4 className="name">
                      <Link to="/giang-vien/chi-tiet">{teacher.name}</Link>
                    </h4>
                    <span className="designation">{teacher.designation}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="rs-testimonial home-style1 pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="sec-title mb-50 md-mb-30 text-center">
            <div className="sub-title primary">{testimonialSection.sub_title}</div>
            <h2 className="title mb-0">{testimonialSection.title}</h2>
          </div>
          <Swiper
            modules={[Pagination, Autoplay]}
            loop
            spaceBetween={30}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            speed={800}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
            }}
          >
            {indexTestimonials.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="testi-item">
                  <div className="author-desc">
                    <div className="desc">
                      <img
                        className="quote"
                        src={`/${testimonialSection.quote_icon}`}
                        alt=""
                      />
                      {item.text}
                    </div>
                    <div className="author-img">
                      <img src={item.image} alt="" />
                    </div>
                  </div>
                  <div className="author-part">
                    <span className="name">{item.name}</span>
                    <span className="designation">{item.designation}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Partner Section */}
      <div className="rs-partner pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="sec-title2 text-center mb-50 md-mb-30">
            <h2 className="title mb-0">
              Các Đơn Vị Tổ Chức Thi &amp; Cấp Chứng Chỉ{' '}
              <span style={{ color: '#0b0c51' }}>Chuẩn Bộ GD&amp;ĐT</span>
            </h2>
            <div className="desc mt-15">{partnerSection.desc}</div>
          </div>
          <Swiper
            modules={[Autoplay]}
            loop
            spaceBetween={30}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            speed={800}
            breakpoints={{
              0: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 5 },
            }}
          >
            {partners.map((partner) => (
              <SwiperSlide key={partner.name}>
                <div className="partner-item">
                  <img src={partner.image} alt={partner.name} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Section bg Wrap 2 */}
      <div className="bg2">
        {/* Blog Section */}
        <div id="rs-blog" className="rs-blog style1 pt-94 pb-100 md-pt-64 md-pb-70">
          <div className="container">
            <div className="sec-title mb-60 md-mb-30 text-center">
              <div className="sub-title primary">{blogSection.sub_title}</div>
              <h2 className="title mb-0">{blogSection.title}</h2>
            </div>
            <div className="row">
              <div className="col-lg-7 col-md-12 pr-75 md-pr-15 md-mb-50">
                {blogSection.blog_items?.map((item, idx) => (
                  <div
                    className={`row align-items-center no-gutter white-bg blog-item${
                      idx < (blogSection.blog_items.length - 1) ? ' mb-30' : ''
                    }`}
                    key={item.title}
                  >
                    <div className="col-md-6">
                      <div className="image-part">
                        <Link to="/tin-tuc/chi-tiet">
                          <img src={item.image} alt="" />
                        </Link>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="blog-content">
                        <ul className="blog-meta">
                          <li>
                            <i className="fa fa-user-o" /> {item.author}
                          </li>
                        </ul>
                        <h3 className="title">
                          <Link to="/tin-tuc/chi-tiet">{item.title}</Link>
                        </h3>
                        <div className="btn-part">
                          <Link className="readon-arrow" to="/tin-tuc/chi-tiet">
                            {item.btn}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-lg-5 lg-pl-0">
                {schedule.map((item, idx) => (
                  <div
                    className={`events-short${idx < schedule.length - 1 ? ' mb-30' : ''}`}
                    key={`${item.day}-${item.event_title}`}
                  >
                    <div className="date-part">
                      <span className="month">{item.month}</span>
                      <div className="date">{item.day}</div>
                    </div>
                    <div className="content-part">
                      <div className="categorie">
                        {item.categories.map((cat, i) => (
                          <span key={cat}>
                            <Link to="/lien-he">{cat}</Link>
                            {i < item.categories.length - 1 && ' & '}
                          </span>
                        ))}
                      </div>
                      <h4 className="title mb-0">
                        <Link to="/lien-he">{item.event_title}</Link>
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter section */}
        <div className="rs-newsletter style1 mb--124 sm-mb-0 sm-pb-70">
          <div className="container">
            <div className="newsletter-wrap">
              <div className="row y-middle">
                <div className="col-md-6 sm-mb-30">
                  <div className="sec-title">
                    <div className="sub-title white-color">{newsletter.sub_title}</div>
                    <h2 className="title mb-0 white-color">
                      {withLineBreaks(newsletter.title_html_br)}
                    </h2>
                  </div>
                </div>
                <div className="col-md-6">
                  <form
                    className="newsletter-form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      openLead()
                    }}
                  >
                    <input
                      type="email"
                      name="email"
                      placeholder={newsletter.form?.input_placeholder}
                      required
                    />
                    <button type="submit">{newsletter.form?.button}</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
