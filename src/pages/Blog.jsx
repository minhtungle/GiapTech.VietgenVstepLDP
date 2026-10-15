import { Link } from 'react-router-dom'

import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { pages, posts } from '../data/content.js'
import QuickSignup from '../components/QuickSignup.jsx'

const page = pages.blog
const sections = page.sections
const blogSection = sections.find((s) => s.name === 'Blog Section') || {}
const newsletter = sections.find((s) => s.name === 'Newsletter section') || {}
const sidebar = blogSection.sidebar || {}

/** Đưa mọi đường dẫn ảnh về dạng tuyệt đối /assets/... */
const imagePath = (src) => (src?.startsWith('/') ? src : `/${src}`)

export default function Blog() {
  return (
    <>
      <Seo title={page.title} description={page.description} />
      <Breadcrumbs title={page.breadcrumb?.h1} subText="Tin Tức" />

      {/* Blog Section */}
      <div className="rs-inner-blog pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-12 order-last">
              <div className="widget-area">
                <div className="search-widget mb-50">
                  <div className="search-wrap">
                    <input
                      type="search"
                      placeholder={sidebar.search?.placeholder}
                      name={sidebar.search?.name}
                      className="search-input"
                      defaultValue=""
                    />
                    <button type="submit" value="Search">
                      <i className={sidebar.search?.icon} />
                    </button>
                  </div>
                </div>

                <div className="recent-posts-widget mb-50">
                  <h3 className="widget-title">{sidebar.recent_posts?.title}</h3>
                  {sidebar.recent_posts?.items?.map((item) => (
                    <div className="show-featured" key={item.title}>
                      <div className="post-img">
                        <Link to="/tin-tuc/chi-tiet">
                          <img src={imagePath(item.image)} alt="" />
                        </Link>
                      </div>
                      <div className="post-desc">
                        <Link to="/tin-tuc/chi-tiet">{item.title}</Link>
                        <span className="date">
                          <i className="fa fa-calendar" /> {item.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="widget-archives mb-50">
                  <h3 className="widget-title">{sidebar.archives?.title}</h3>
                  <ul>
                    {sidebar.archives?.items?.map((item) => (
                      <li key={item.text}>
                        <Link to="/tin-tuc">{item.text}</Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="widget-archives mb-50">
                  <h3 className="widget-title">{sidebar.categories?.title}</h3>
                  <ul>
                    {sidebar.categories?.items?.map((item) => (
                      <li key={item.text}>
                        <Link to="/tin-tuc">{item.text}</Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="recent-posts mb-50">
                  <h3 className="widget-title">{sidebar.meta_widget?.title}</h3>
                  <ul>
                    {sidebar.meta_widget?.items?.map((item) => (
                      <li key={item.text}>
                        <Link to={item.href === 'index.html' ? '/' : '/tin-tuc'}>
                          {item.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-8 pr-50 md-pr-15">
              <div className="row">
                {posts.map((post, idx) => (
                  <div
                    className={`col-lg-12${idx < posts.length - 1 ? ' mb-70' : ''}`}
                    key={post.id}
                  >
                    <div className="blog-item">
                      <div className="blog-img">
                        <Link to="/tin-tuc/chi-tiet">
                          <img src={imagePath(post.image)} alt="" />
                        </Link>
                      </div>
                      <div className="blog-content">
                        <h3 className="blog-title">
                          <Link to="/tin-tuc/chi-tiet">{post.title}</Link>
                        </h3>
                        <div className="blog-meta">
                          <ul className="btm-cate">
                            <li>
                              <div className="blog-date">
                                <i className={blogSection.post_meta_icons?.date} /> {post.date}
                              </div>
                            </li>
                            <li>
                              <div className="author">
                                <i className={blogSection.post_meta_icons?.author} />{' '}
                                {post.author}
                              </div>
                            </li>
                            <li>
                              <div className="tag-line">
                                <i className={blogSection.post_meta_icons?.category} />
                                <Link to="/tin-tuc">{post.category}</Link>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div className="blog-desc">{post.excerpt}</div>
                        <div className="blog-button">
                          <Link className="blog-btn" to="/tin-tuc/chi-tiet">
                            {blogSection.post_button}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
