import { Link } from 'react-router-dom'

import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { pages } from '../data/content.js'

const page = pages.team
const team = page.sections.find((s) => s.name === 'Team Section') || {}
const socialLinks = team.social_links_per_item || []

export default function Teachers() {
  return (
    <>
      <Seo title={page.title} description={page.description} />
      <Breadcrumbs title={page.breadcrumb?.h1} subText="Giảng Viên" />

      {/* Team Section */}
      <div
        id="rs-team"
        className="rs-team style1 pt-94 pb-100 md-pt-64 md-pb-70 white-bg"
      >
        <div className="container">
          <div className="sec-title text-center mb-45">
            <span className="sub-title">{team.sub_title}</span>
            <h2 className="title">{team.title}</h2>
            <p className="desc pt-20">{team.desc_plain}</p>
          </div>
          <div className="row">
            {team.items?.map((teacher) => (
              <div className="col-lg-4 col-sm-6 mb-30" key={teacher.name}>
                <div className="team-item">
                  <img src={teacher.image} alt={teacher.image_alt} />
                  <div className="content-part">
                    <h4 className="name">
                      <Link to="/giang-vien/chi-tiet">{teacher.name}</Link>
                    </h4>
                    <span className="designation">{teacher.designation}</span>
                    <ul className="social-links">
                      {socialLinks.map((link) => (
                        <li key={link.icon}>
                          <a href={link.href} target="_blank" rel="noreferrer">
                            <i className={link.icon} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
