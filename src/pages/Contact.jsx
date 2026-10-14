import { useState } from 'react'

import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { postJSON } from '../lib/api.js'
import { pages } from '../data/content.js'

const page = pages.contact
const contactSection = page.sections.find((s) => s.name === 'Contact Section') || {}
const topMedia = contactSection.top_media || {}
const branches = contactSection.branches || []
const quickContact = contactSection.quick_contact || {}
const formFields = quickContact.form?.fields || []

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

export default function Contact() {
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    setSending(true)
    setFeedback({ text: 'Đang gửi thông tin...', error: false })

    try {
      const res = await postJSON('/api/register', data)
      setFeedback({ text: res.message, error: !res.ok })
      if (res.ok) form.reset()
    } catch {
      setFeedback({
        text: 'Không kết nối được máy chủ. Vui lòng gọi hotline 0866.538.942.',
        error: true,
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Seo title={page.title} description={page.description} />
      <Breadcrumbs title={page.breadcrumb?.h1} subText="Liên Hệ" />

      {/* Contact Section */}
      <div className="contact-page-section pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="rs-contact-img mb-90">
            <div className="row">
              <div className="col-lg-6 md-mb-30">
                <div className="img-part">
                  <img src={topMedia.image?.src} alt={topMedia.image?.alt} />
                </div>
              </div>
              <div className="col-lg-6 pl-50 md-pl-15">
                <div className="contact-map3">
                  <iframe src={topMedia.map_iframe} title="Bản đồ VietGen" />
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-90 md-mb-50">
            {branches.map((branch, idx) => (
              <div
                className={`col-lg-4 col-md-12${
                  idx < branches.length - 1 ? ' md-mb-30' : ''
                }`}
                key={branch.title}
              >
                <div className="rs-contact-wrap">
                  <div className="inner-part text-center">
                    <h2 className="title2">{branch.title}</h2>
                  </div>
                  {branch.items.map((item) => (
                    <div className="address-item" key={item.label}>
                      <div className="address-icon">
                        <i className={item.icon} />
                      </div>
                      <div className="address-text">
                        <span className="label">{item.label}</span>
                        <span className="des">
                          {item.href ? <a href={item.href}>{item.value}</a> : item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rs-quick-contact">
            <div className="inner-part text-center mb-50">
              <h2 className="title mb-15">{quickContact.title}</h2>
              <p>{withLineBreaks(quickContact.desc_html_br)}</p>
            </div>

            {feedback && (
              <div
                id="form-messages"
                className={feedback.error ? 'error' : 'success'}
                role="status"
              >
                {feedback.text}
              </div>
            )}

            <form id="contact-form" onSubmit={handleSubmit}>
              <div className="row">
                {formFields
                  .filter((field) => field.type !== 'textarea')
                  .map((field) => (
                    <div className="col-lg-6 mb-35 col-md-12" key={field.id}>
                      <input
                        className="from-control"
                        type={field.type}
                        id={field.id}
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    </div>
                  ))}

                {formFields
                  .filter((field) => field.type === 'textarea')
                  .map((field) => (
                    <div className="col-lg-12 mb-50" key={field.id}>
                      <textarea
                        className="from-control"
                        id={field.id}
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    </div>
                  ))}
              </div>
              <div className="form-group mb-0">
                <input
                  className="btn-send"
                  type="submit"
                  value={sending ? 'Đang gửi...' : quickContact.form?.submit}
                  disabled={sending}
                />
              </div>
            </form>
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
                    <h2 className="title mb-0 white-color">Đăng Ký Nhận Tin VietGen</h2>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email của bạn"
                    required
                  />
                  <button type="submit">Đăng Ký</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
