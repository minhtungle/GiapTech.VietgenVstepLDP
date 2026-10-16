import { useState } from 'react'
import { postJSON } from '../lib/api.js'

/**
 * Form đăng ký nhanh bằng số điện thoại ở dải CTA cuối trang.
 *
 * Khách chỉ cần để lại số là tư vấn viên gọi lại, không phải điền cả biểu mẫu.
 * Gửi thẳng về hộp thư trung tâm qua /api/register, giống form đăng ký đầy đủ.
 */
export default function QuickSignup({ placeholder, buttonText }) {
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState(null)

  /** Số Việt Nam: 10-11 chữ số, cho phép khoảng trắng, dấu chấm, gạch ngang. */
  function isValidPhone(value) {
    const digits = value.replace(/[\s.()-]/g, '')
    return /^(0|\+84)\d{9,10}$/.test(digits)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isValidPhone(phone)) {
      setFeedback({ text: 'Số điện thoại chưa đúng. Vui lòng kiểm tra lại.', error: true })
      return
    }

    setSending(true)
    setFeedback({ text: 'Đang gửi thông tin...', error: false })

    try {
      // Backend bắt buộc có tên và email; ở đây khách chỉ để lại số nên điền
      // giá trị thay thế để tư vấn viên biết lead này đến từ form rút gọn.
      const res = await postJSON('/api/register', {
        name: `Khách để lại SĐT ${phone}`,
        phone,
        email: 'tuyensinh.vstep@vietgeneducation.edu.vn',
        message: 'Khách đăng ký nhanh qua form cuối trang, chỉ để lại số điện thoại.',
      })

      if (res.ok) {
        setFeedback({ text: 'Đã nhận thông tin! VIETGEN sẽ gọi lại cho bạn sớm.', error: false })
        setPhone('')
      } else {
        setFeedback({ text: res.message || 'Gửi không thành công, vui lòng thử lại.', error: true })
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
    <>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="tel"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder={placeholder || 'Nhập số điện thoại của bạn'}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit" disabled={sending}>
          {sending ? 'Đang gửi...' : buttonText || 'Đăng Ký'}
        </button>
      </form>

      {feedback && (
        <div
          className={`vg-quick-msg ${feedback.error ? 'vg-quick-msg-error' : 'vg-quick-msg-ok'}`}
          role="status"
        >
          {feedback.text}
        </div>
      )}
    </>
  )
}
