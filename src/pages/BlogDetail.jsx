import { Link, useParams } from 'react-router-dom'

import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { pages } from '../data/content.js'
import QuickSignup from '../components/QuickSignup.jsx'

const page = pages['blog-single']
const sections = page.sections
const blogSection = sections.find((s) => s.name === 'Blog Section') || {}
const article = blogSection.article || {}
const sidebar = blogSection.sidebar || {}
const meta = article.meta || {}
const comment = article.comment_area || {}

// Ánh xạ đường dẫn HTML cũ sang route React cho các liên kết trong sidebar.
const ROUTE_BY_FILE = {
  'course.html': '/khoa-hoc',
  'team.html': '/giang-vien',
  'contact.html': '/lien-he',
  'index.html': '/',
}
const toRoute = (href) => ROUTE_BY_FILE[href] || '/tin-tuc'

/** Render một khối nội dung bài viết theo trường `type`. */
function Block({ block }) {
  switch (block.type) {
    case 'p':
      return (
        <div className="blog-desc mb-40">
          <p>{block.text}</p>
        </div>
      )
    case 'blockquote':
      return (
        <blockquote>
          <p>{block.text}</p>
        </blockquote>
      )
    case 'h2':
      return <h2 className="title mb-40">{block.text}</h2>
    case 'h4':
      return <h4 className={block.class || 'sm-title'}>{block.text}</h4>
    case 'img':
      return (
        <div className="blog-img mb-40">
          <img src={block.src} alt={block.alt} />
        </div>
      )
    case 'ul':
      return (
        <ul className={`${block.class || 'unorder-list'} mb-20`}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    default:
      return null
  }
}

export default function BlogDetail() {
  // Chưa có slug riêng cho từng bài nên luôn hiển thị bài viết mẫu đầu tiên.
  useParams()

  return (
    <>
      <Seo title={page.title} description={page.description} />
      <Breadcrumbs title={page.breadcrumb?.h1} subText="Chi Tiết Bài Viết" />

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

                <div className="recent-posts mb-50">
                  <h3 className="widget-title">{sidebar.related_posts?.title}</h3>
                  <ul>
                    {sidebar.related_posts?.items?.map((item) => (
                      <li key={item.text}>
                        <Link to="/tin-tuc/chi-tiet">{item.text}</Link>
                      </li>
                    ))}
                  </ul>
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
                  <h3 className="widget-title">{sidebar.links?.title}</h3>
                  <ul>
                    {sidebar.links?.items?.map((item) => (
                      <li key={item.text}>
                        <Link to={toRoute(item.href)}>{item.text}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-8 pr-50 md-pr-15">
              <div className="blog-deatails">
                <div className="bs-img">
                  <img
                    src={article.featured_image?.src}
                    alt={article.featured_image?.alt}
                  />
                </div>
                <div className="blog-full">
                  <ul className="single-post-meta">
                    <li>
                      <span className="p-date">
                        <i className={meta.icons?.date} /> {meta.date}
                      </span>
                    </li>
                    <li>
                      <span className="p-date">
                        <i className={meta.icons?.author} /> {meta.author}
                      </span>
                    </li>
                    <li className="Post-cate">
                      <div className="tag-line">
                        <i className={meta.icons?.category} />
                        <Link to="/tin-tuc">{meta.category}</Link>
                      </div>
                    </li>
                    <li className="post-comment">
                      <i className={meta.icons?.comments} /> {meta.comments}
                    </li>
                  </ul>
                  {article.blocks?.map((block, idx) => (
                    <Block block={block} key={idx} />
                  ))}
                </div>
              </div>

              <div className="ps-navigation">
                <ul>
                  <li>
                    <Link to="/tin-tuc">
                      <span className="next-link">
                        {article.navigation?.[0]?.text}
                        <i className={article.navigation?.[0]?.icon} />
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/tin-tuc">
                      <span className="link-text">{article.navigation?.[1]?.text}</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="comment-area">
                <div className="comment-full">
                  <h3 className="reply-title">{comment.title}</h3>
                  <p>
                    <span>{comment.note}</span>
                  </p>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="row">
                      <div className="col-md-6 col-sm-12 mb-20">
                        <div className="form-group">
                          <label className="mb-8" htmlFor="comment-name">
                            Họ tên*
                          </label>
                          <input
                            type="text"
                            id="comment-name"
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-12 mb-20">
                        <div className="form-group">
                          <label className="mb-8" htmlFor="comment-email">
                            Email*
                          </label>
                          <input
                            type="email"
                            id="comment-email"
                            className="form-control"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-12 col-sm-12 mb-45">
                        <div className="form-group">
                          <label className="mb-8" htmlFor="comment-message">
                            Nội dung bình luận...
                          </label>
                          <textarea
                            id="comment-message"
                            cols={40}
                            rows={10}
                            className="textarea form-control"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="submit-btn">
                      <input
                        name="submit"
                        type="submit"
                        className="submit"
                        value={comment.form?.submit}
                      />
                    </div>
                  </form>
                </div>
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
                      <img src="/assets/images/newsletter.png" alt="images" />
                    </div>
                    <h2 className="title mb-0 white-color">Đăng Ký Nhận Tin Tức Mới</h2>
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
