import { useState, useEffect } from 'react'
import { COURSE_OPTIONS, REGIONS } from '../data/site.js'
import { postJSON } from '../lib/api.js'

/**
 * Popup đăng ký tư vấn. Thay cho vietgen-popup.js của bản jQuery.
 * Gửi dữ liệu lên /api/register.
 */
export default function LeadPopup({ open, onClose }) {
  const [region, setRegion] = useState(REGIONS[0])
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Đóng bằng phím Esc và khoá cuộn nền khi đang mở.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    setSending(true)
    setFeedback({ text: 'Đang gửi thông tin...', error: false })

    try {
      const res = await postJSON('/api/register', { ...data, region })
      setFeedback({ text: res.message, error: !res.ok })
      if (res.ok) {
        form.reset()
        setTimeout(onClose, 2500)
      }
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
    <div
      id="vgLeadPopup"
      className={`vg-popup-overlay${open ? ' vg-popup-active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="vg-popup-box" role="dialog" aria-modal="true" aria-label="Đăng ký test đầu vào">
        <button type="button" className="vg-popup-close" aria-label="Đóng" onClick={onClose}>
          &times;
        </button>

        <div className="row g-0">
          <div className="col-lg-6 vg-popup-left">
            <div className="vg-popup-badge">
              <i className="fa fa-calendar" /> KHAI GIẢNG LỚP MỚI THÁNG 10/2026
            </div>
            <h3 className="vg-popup-title">
              HỌC SỚM - THI SỚM
              <br />
              NHẬN CHỨNG CHỈ SỚM
            </h3>
            <div className="vg-popup-subtitle">CHINH PHỤC VSTEP B1 - B2 - C1</div>
            <ul className="vg-popup-tags">
              <li>
                <i className="fa fa-graduation-cap" /> Sinh viên xét tốt nghiệp
              </li>
              <li>
                <i className="fa fa-book" /> Cao học, thi công chức
              </li>
            </ul>
            <div className="vg-popup-img">
              <img src="/assets/images/vstep/about.jpg" alt="Học viên VietGen" />
            </div>
            <div className="vg-popup-stats">
              {[
                ['9-10', 'Buổi ôn cấp tốc'],
                ['2+', 'Cơ sở toàn quốc'],
                ['1:1', 'Giáo viên + Trợ giảng'],
                ['<20', 'Học viên/lớp'],
              ].map(([value, label]) => (
                <div className="vg-popup-stat" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-6 vg-popup-right">
            <h4 className="vg-popup-form-title">Đăng Ký Test Đầu Vào Miễn Phí</h4>

            <div className="vg-popup-region-tabs">
              {REGIONS.map((r) => (
                <button
                  type="button"
                  key={r}
                  className={`vg-region-tab${region === r ? ' active' : ''}`}
                  onClick={() => setRegion(r)}
                >
                  {r}
                </button>
              ))}
            </div>

            <form className="vg-popup-form" onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Họ và tên" required />
              <input type="tel" name="phone" placeholder="Số điện thoại" required />
              <input type="email" name="email" placeholder="Email" required />
              <select name="course" defaultValue="">
                <option value="">Chứng chỉ bạn cần</option>
                {COURSE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button type="submit" className="vg-popup-submit" disabled={sending}>
                {sending ? 'ĐANG GỬI...' : 'NHẬN TƯ VẤN NGAY'}
              </button>
            </form>

            {feedback && (
              <div
                className={`vg-popup-message ${
                  feedback.error ? 'vg-popup-message-error' : 'vg-popup-message-ok'
                }`}
                role="status"
              >
                {feedback.text}
              </div>
            )}

            <div className="vg-popup-note">
              <i className="fa fa-shield" /> Thông tin của bạn được bảo mật tuyệt đối
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
