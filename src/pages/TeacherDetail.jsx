import { useParams } from 'react-router-dom'

import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { pages } from '../data/content.js'

const page = pages['team-single']
const sections = page.sections
const profile = sections.find((s) => s.name === 'Profile Section') || {}
const newsletter = sections.find((s) => s.name === 'Newsletter section') || {}

const imageCol = profile.image_column || {}
const contentCol = profile.content_column || {}
const bottom = profile.bottom_content || {}

export default function TeacherDetail() {
  // Dữ liệu chưa có hồ sơ riêng theo slug nên luôn hiển thị hồ sơ mẫu đầu tiên.
  useParams()

  const skills = contentCol.skills || []
  const half = Math.ceil(skills.length / 2)
  const skillColumns = [skills.slice(0, half), skills.slice(half)]

  return (
    <>
      <Seo title={page.title} description={page.description} />
      <Breadcrumbs title={page.breadcrumb?.h1} subText="Chi Tiết Giảng Viên" />

      {/* Profile Section */}
      <section className="profile-section pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="row clearfix">
            {/* Image Section */}
            <div className="image-column col-lg-5 md-mb-50">
              <div className="inner-column mb-50 md-mb-0">
                <div className="image">
                  <img src={imageCol.image} alt={imageCol.image_alt} />
                </div>
                <div className="team-content text-center">
                  <h3>{imageCol.name}</h3>
                  <div className="text">{imageCol.role}</div>
                  <ul className="personal-info">
                    {imageCol.personal_info?.map((info) => (
                      <li className={info.type} key={info.type}>
                        <span>
                          <i className={`glyph-icon ${info.icon}`}> </i>{' '}
                        </span>
                        <a href={info.href}>{info.text}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="social-box">
                  {imageCol.social?.map((item) => (
                    <a
                      href={item.href}
                      className={item.icon}
                      key={item.icon}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="content-column col-lg-7 pl-60 pt-50 md-pl-15 md-pt-0">
              <div className="inner-column">
                <h2>{contentCol.h2}</h2>
                <h4>{contentCol.h4}</h4>
                <ul className="student-list">
                  {contentCol.student_list?.map((item) => (
                    <li key={item.text}>
                      {item.rating ? (
                        <>
                          <span className="theme_color">{item.rating}</span>{' '}
                          {Array.from({ length: item.stars }).map((_, i) => (
                            <span className="fa fa-star" key={i} />
                          ))}{' '}
                          {item.reviews}
                        </>
                      ) : (
                        item.text
                      )}
                    </li>
                  ))}
                </ul>
                <h5>{contentCol.intro_heading}</h5>
                <p>{contentCol.intro_text}</p>
                <div className="team-skill mb-50">
                  <h3 className="skill-title">{contentCol.skill_title}</h3>
                  <div className="row">
                    {skillColumns.map((column, colIdx) => (
                      <div
                        className={`col-md-6${colIdx === 0 ? ' sm-mb-20' : ''}`}
                        key={colIdx}
                      >
                        {column.map((skill) => (
                          <div className="progress rs-progress" key={skill.label}>
                            <div
                              className="progress-bar progress-bar-success"
                              role="progressbar"
                              aria-valuenow={skill.percent}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              style={{ width: `${skill.percent}%` }}
                            >
                              <span className="pb-label">{skill.label}</span>
                              <span className="pb-percent">{skill.percent}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="content-part">
                <h3 className="title">{bottom.title}</h3>
                <p>{bottom.text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
