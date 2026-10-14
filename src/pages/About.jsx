import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'

import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { pages, teachers, testimonials } from '../data/content.js'

const page = pages.about
const sections = page.sections
const findSection = (name) => sections.find((s) => s.name === name) || {}

const about = findSection('About Section')
const cta = findSection('CTA Section')
const counter = findSection('Counter Section')
const tabsSection = findSection('About Section (thứ hai - tabs)')
const team = findSection('Team Section')
const testimonialSection = findSection('Testimonial Section')
const newsletter = findSection('Newsletter section')

// Trang about dùng 3 giảng viên đầu và bản rút gọn của 2 cảm nhận đầu.
const aboutTeachers = teachers.filter((t) => t.appears_on?.includes('about'))
const aboutTestimonials = testimonials.filter((t) => t.appears_on?.includes('about'))

export default function About() {
  const tabs = tabsSection.tabs || []
  const [activeTab, setActiveTab] = useState(tabs.find((t) => t.active)?.id || tabs[0]?.id)

  return (
    <>
      <Seo title={page.title} description={page.description} />
      <Breadcrumbs title={page.breadcrumb?.h1} subText="Giới Thiệu" />

      {/* About Section */}
      <div id="rs-about" className="rs-about style1 pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 order-last padding-0 md-pl-15 md-pr-15 md-mb-30">
              <div className="img-part">
                <img src={about.images?.[0]?.src} alt={about.images?.[0]?.alt} />
              </div>
            </div>
            <div className="col-lg-6 pr-70 md-pr-15">
              <div className="sec-title">
                <div className="sub-title primary">{about.sub_title}</div>
                <h2 className="title mb-17">{about.title}</h2>
                <div className="bold-text mb-22">{about.bold_text}</div>
                <div className="desc">{about.desc}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rs-cta style2">
        <div className="partition-bg-wrap inner-page">
          <div className="container">
            <div className="row y-bottom">
              <div className="col-lg-6 pb-50 md-pt-70 md-pb-70">
                <div className="video-wrap">
                  <a
                    className="popup-videos"
                    href={cta.video?.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className={cta.video?.icon} />
                    <h4 className="title mb-0">{cta.video?.text}</h4>
                  </a>
                </div>
              </div>
              <div className="col-lg-6 pl-62 pt-134 pb-150 md-pt-50 md-pb-50 md-pl-15">
                <div className="sec-title mb-40 md-mb-20">
                  <h2 className="title mb-16">{cta.title}</h2>
                  <div className="desc">{cta.desc}</div>
                </div>
                <div className="btn-part">
                  <Link className="readon2" to="/lien-he">
                    {cta.buttons?.[0]?.text}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Counter Section */}
      <div id="rs-counter" className="rs-counter style2-about pt-100 md-pt-70">
        <div className="container">
          <div className="row couter-area">
            {counter.stats?.map((stat, idx) => (
              <div
                className={`col-md-4${idx < (counter.stats.length - 1) ? ' sm-mb-30' : ''}`}
                key={stat.title}
              >
                <div className="counter-item text-center">
                  <div className="counter-bg">
                    <img src={stat.bg_image} alt="Counter Image" />
                  </div>
                  <div className="counter-text">
                    <h2 className="rs-count">{stat.count}</h2>
                    <h4 className="title mb-0">{stat.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section (tabs) */}
      <div className="rs-about style1 pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 padding-0 md-pl-15 md-pr-15 md-mb-30">
              <div className="img-part">
                <img src={tabsSection.images?.[0]?.src} alt={tabsSection.images?.[0]?.alt} />
              </div>
              <ul className="nav nav-tabs histort-part" role="tablist">
                {tabs.map((tab, idx) => (
                  <li
                    className={`nav-item tab-btns single-history${
                      idx === tabs.length - 1 ? ' last-item' : ''
                    }`}
                    role="presentation"
                    key={tab.id}
                  >
                    <button
                      type="button"
                      className={`nav-link tab-btn${activeTab === tab.id ? ' active' : ''}`}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="icon-part">
                        <i className={tab.tab_icon} />
                      </span>
                      {tab.tab_label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-lg-5 offset-lg-1">
              <div className="tab-content tabs-content">
                {tabs.map((tab) => (
                  <div
                    className={`tab-pane tab fade${
                      activeTab === tab.id ? ' show active' : ''
                    }`}
                    id={tab.id}
                    role="tabpanel"
                    key={tab.id}
                  >
                    <div className="sec-title mb-25">
                      <h2 className="title">{tab.title}</h2>
                      <div className="desc">{tab.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="intro-info-tabs" />
        </div>
      </div>

      {/* Team Section */}
      <div id="rs-team" className="rs-team style1 pt-94 pb-100 md-pt-64 md-pb-70 gray-bg">
        <div className="container">
          <div className="sec-title mb-50 md-mb-30">
            <div className="sub-title primary">{team.sub_title}</div>
            <h2 className="title mb-0">{team.title}</h2>
          </div>
          <Swiper
            className="nav-style2"
            modules={[Navigation, Autoplay]}
            loop
            spaceBetween={30}
            navigation
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            speed={800}
            breakpoints={{
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
            }}
          >
            {aboutTeachers.map((teacher) => (
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
      <div className="rs-testimonial style2 pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 pr-90 md-pr-15 md-mb-30">
              <div className="donation-part">
                <img
                  src={testimonialSection.donation_part?.image}
                  alt={testimonialSection.donation_part?.image_alt}
                />
                <h3 className="title mb-10">{testimonialSection.donation_part?.title}</h3>
                <div className="desc mb-38">{testimonialSection.donation_part?.desc}</div>
                <div className="btn-part">
                  <Link className="readon2" to="/lien-he">
                    {testimonialSection.donation_part?.buttons?.[0]?.text}
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-7 lg-pl-0 ml--15 md-ml-0">
              {aboutTestimonials.map((item, idx) => (
                <div
                  className={`testi-wrap${
                    idx < aboutTestimonials.length - 1 ? ' mb-50' : ''
                  }`}
                  key={item.id}
                >
                  <div className="img-part">
                    <img src={item.image} alt="" />
                  </div>
                  <div className="content-part new-content pt-12">
                    <div className="desc">{item.text_short_about || item.text}</div>
                    <div className="info">
                      <h5 className="name">{item.name}</h5>
                      <div className="designation">{item.designation}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
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
    </>
  )
}
