import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { useLeadPopup } from '../App.jsx'
import { pages } from '../data/content.js'
import QuickSignup from '../components/QuickSignup.jsx'

const page = pages['course-single']
const sections = page.sections
const intro = sections.find((s) => s.name === 'Intro Courses') || {}

const tabs = intro.tabs || []
const overview = intro.tab_overview || {}
const curriculum = intro.tab_curriculum || []
const instructor = intro.tab_instructor || {}
const faq = intro.tab_faq || []
const reviews = intro.tab_reviews || []
const sidebar = intro.sidebar || {}

/** Accordion dùng chung cho tab Lộ Trình và tab Hỏi Đáp. */
function Accordion({ items, renderHeader, renderBody, defaultOpen }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen)

  return (
    <div className="accordion-box">
      {items.map((item, idx) => {
        const expanded = openIndex === idx
        return (
          <div className="card accordion block" key={idx}>
            <div className="card-header">
              <h5 className="mb-0">
                <button
                  type="button"
                  className={`btn btn-link acc-btn${expanded ? '' : ' collapsed'}`}
                  aria-expanded={expanded}
                  onClick={() => setOpenIndex(expanded ? -1 : idx)}
                >
                  {renderHeader(item)}
                </button>
              </h5>
            </div>
            <div className={`collapse${expanded ? ' show' : ''}`}>
              <div className={`card-body acc-content${expanded ? ' current' : ''}`}>
                {renderBody(item)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function CourseDetail() {
  // Dữ liệu mới có một khóa chi tiết nên mọi slug đều hiển thị khóa VSTEP B1 cấp tốc.
  useParams()
  const openLead = useLeadPopup()
  const [activeTab, setActiveTab] = useState(tabs.find((t) => t.active)?.id || tabs[0]?.id)

  return (
    <>
      <Seo title={page.title} description={page.description} />
      <Breadcrumbs title={page.breadcrumb?.h1} subText="Chi Tiết Khóa Học" />

      {/* Intro Courses */}
      <section className="intro-section gray-bg pt-94 pb-100 md-pt-64 md-pb-70">
        <div className="container">
          <div className="row clearfix">
            {/* Content Column */}
            <div className="col-lg-8 md-mb-50">
              <div className="intro-info-tabs">
                <ul className="nav nav-tabs intro-tabs tabs-box" role="tablist">
                  {tabs.map((tab) => (
                    <li className="nav-item tab-btns" role="presentation" key={tab.id}>
                      <button
                        type="button"
                        className={`nav-link tab-btn${activeTab === tab.id ? ' active' : ''}`}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="tab-content tabs-content">
                  {/* Tổng Quan */}
                  <div
                    className={`tab-pane tab fade${
                      activeTab === 'prod-overview' ? ' show active' : ''
                    }`}
                    id="prod-overview"
                    role="tabpanel"
                  >
                    <div className="content white-bg pt-30">
                      <div className="course-overview">
                        <div className="inner-box">
                          <h4>{overview.heading}</h4>
                          {overview.paragraphs?.map((text, idx) => (
                            <p key={idx}>{text}</p>
                          ))}
                          <ul className="student-list">
                            {overview.student_list?.map((item) => (
                              <li key={item.text}>
                                {item.highlight ? (
                                  <>
                                    <span className="theme_color">{item.highlight}</span>
                                    {item.rest}
                                  </>
                                ) : (
                                  item.text
                                )}
                              </li>
                            ))}
                          </ul>
                          <h3>{overview.sub_heading_1}</h3>
                          <ul className="review-list">
                            {overview.outcomes?.map((text) => (
                              <li key={text}>{text}</li>
                            ))}
                          </ul>
                          <h3>{overview.sub_heading_2}</h3>
                          <ul className="review-list">
                            {overview.audience?.map((text) => (
                              <li key={text}>{text}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lộ Trình */}
                  <div
                    className={`tab-pane fade${
                      activeTab === 'prod-curriculum' ? ' show active' : ''
                    }`}
                    id="prod-curriculum"
                    role="tabpanel"
                  >
                    <div className="content">
                      <Accordion
                        items={curriculum}
                        defaultOpen={curriculum.findIndex((c) => c.expanded)}
                        renderHeader={(item) => item.heading}
                        renderBody={(item) =>
                          item.lessons.map((lesson) => (
                            <div className="content" key={lesson}>
                              <div className="clearfix">
                                <div className="pull-left">{lesson}</div>
                              </div>
                            </div>
                          ))
                        }
                      />
                    </div>
                  </div>

                  {/* Giáo Viên */}
                  <div
                    className={`tab-pane fade${
                      activeTab === 'prod-instructor' ? ' show active' : ''
                    }`}
                    id="prod-instructor"
                    role="tabpanel"
                  >
                    <div className="content pt-30 pb-30 pl-30 pr-30 white-bg">
                      <h3 className="instructor-title">{instructor.heading}</h3>
                      <div className="row rs-team style1 transparent-bg clearfix">
                        {instructor.teachers?.map((teacher, idx) => (
                          <div
                            className={`col-lg-6 col-md-6 col-sm-12${
                              idx === 0 ? ' sm-mb-30' : ''
                            }`}
                            key={teacher.name}
                          >
                            <div className="team-item">
                              <img src={teacher.image} alt="" />
                              <div className="content-part">
                                <h4 className="name">
                                  <Link
                                    to={
                                      teacher.href === 'team.html'
                                        ? '/giang-vien'
                                        : '/giang-vien/chi-tiet'
                                    }
                                  >
                                    {teacher.name}
                                  </Link>
                                </h4>
                                <span className="designation">{teacher.designation}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hỏi Đáp */}
                  <div
                    className={`tab-pane fade${
                      activeTab === 'prod-faq' ? ' show active' : ''
                    }`}
                    id="prod-faq"
                    role="tabpanel"
                  >
                    <div className="content">
                      <Accordion
                        items={faq}
                        defaultOpen={faq.findIndex((f) => f.expanded)}
                        renderHeader={(item) => item.question}
                        renderBody={(item) => <div className="content">{item.answer}</div>}
                      />
                    </div>
                  </div>

                  {/* Đánh Giá */}
                  <div
                    className={`tab-pane fade${
                      activeTab === 'prod-reviews' ? ' show active' : ''
                    }`}
                    id="prod-reviews"
                    role="tabpanel"
                  >
                    <div className="content pt-30 pb-30 white-bg">
                      {reviews.map((review) => (
                        <div className="cource-review-box mb-30" key={review.name}>
                          <h4>{review.name}</h4>
                          <div className="rating">
                            <span className="total-rating">{review.rating}</span>{' '}
                            {Array.from({ length: review.stars }).map((_, i) => (
                              <span className="fa fa-star" key={i} />
                            ))}
                            &ensp; {review.label}
                          </div>
                          <div className="text">{review.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Column */}
            <div className="video-column col-lg-4">
              <div className="inner-column">
                <div className="intro-video media-icon">
                  <img
                    className="video-img"
                    src={sidebar.video?.image}
                    alt={sidebar.video?.image_alt}
                  />
                  <a
                    className="popup-videos"
                    href={sidebar.video?.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fa fa-play" />
                  </a>
                  <h4>{sidebar.video?.caption}</h4>
                </div>
                <div className="course-features-info">
                  <ul>
                    {sidebar.features?.map((feature) => (
                      <li className="lectures-feature" key={feature.label}>
                        <i className={feature.icon} />
                        <span className="label">{feature.label}</span>
                        <span className="value">{feature.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="btn-part">
                  <button type="button" className="btn readon2" onClick={openLead}>
                    {sidebar.buttons?.[0]?.text}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter section */}
      <div className="rs-newsletter style1 gray-bg mb--90 sm-mb-0 sm-pb-70">
        <div className="container">
          <div className="newsletter-wrap">
            <div className="row y-middle">
              <div className="col-lg-6 col-md-12 md-mb-30">
                <div className="content-part">
                  <div className="sec-title">
                    <div className="title-icon md-mb-15">
                      <img src="/assets/images/newsletter.png" alt="images" />
                    </div>
                    <h2 className="title mb-0 white-color">Đăng Ký Test Đầu Vào Miễn Phí</h2>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <QuickSignup placeholder="Nhập số điện thoại của bạn" buttonText="Đăng Ký" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
