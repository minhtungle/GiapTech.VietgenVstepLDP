import { useState, useEffect } from 'react'
import { useLeadPopup } from '../App.jsx'

/**
 * Thanh đếm ngược ưu đãi 12 tiếng, bám đáy màn hình ở mọi trang.
 *
 * Mỗi khách có mốc riêng: lần đầu vào web thì ghi thời điểm hết hạn vào
 * localStorage, nhờ vậy tải lại trang hay chuyển trang không bị reset về 12:00:00
 * - thứ đó nhìn là biết giả ngay. Hết giờ thì tự mở chu kỳ mới.
 *
 * Khách đóng thanh thì không hiện lại trong phiên đó (sessionStorage), tránh
 * làm phiền người đã từ chối.
 */

const STORAGE_KEY = 'vg-offer-deadline'
const DISMISS_KEY = 'vg-offer-dismissed'
const WINDOW_MS = 12 * 60 * 60 * 1000

/** Lấy mốc hết hạn của khách, tạo mới nếu chưa có hoặc đã quá hạn. */
function getDeadline() {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY))
    if (saved && saved > Date.now()) return saved
  } catch {
    // Trình duyệt chặn localStorage (chế độ riêng tư): vẫn chạy, chỉ là mốc
    // sẽ tính lại mỗi lần tải trang.
  }

  const next = Date.now() + WINDOW_MS
  try {
    localStorage.setItem(STORAGE_KEY, String(next))
  } catch {
    /* bỏ qua */
  }
  return next
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function OfferCountdown() {
  const openLead = useLeadPopup()
  const [deadline, setDeadline] = useState(null)
  const [left, setLeft] = useState(WINDOW_MS)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return
    } catch {
      /* bỏ qua */
    }
    setDeadline(getDeadline())
    setHidden(false)
  }, [])

  useEffect(() => {
    if (!deadline) return

    const tick = () => {
      const remain = deadline - Date.now()
      if (remain <= 0) {
        // Hết hạn: mở chu kỳ 12 tiếng mới thay vì để đồng hồ đứng ở 00:00:00.
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* bỏ qua */
        }
        setDeadline(getDeadline())
        return
      }
      setLeft(remain)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])

  function dismiss() {
    setHidden(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* bỏ qua */
    }
  }

  if (hidden || !deadline) return null

  const totalSec = Math.floor(left / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  return (
    <div className="vg-offer-bar" role="region" aria-label="Ưu đãi có hạn">
      <div className="vg-offer-inner">
        <div className="vg-offer-text">
          <span className="vg-offer-badge">ƯU ĐÃI</span>
          <span className="vg-offer-headline">
            Giảm học phí cho học viên đăng ký hôm nay
          </span>
        </div>

        <div className="vg-offer-clock" aria-label={`Còn ${hours} giờ ${minutes} phút`}>
          <span className="vg-offer-unit">
            <strong>{pad(hours)}</strong>
            <small>Giờ</small>
          </span>
          <i>:</i>
          <span className="vg-offer-unit">
            <strong>{pad(minutes)}</strong>
            <small>Phút</small>
          </span>
          <i>:</i>
          <span className="vg-offer-unit">
            <strong>{pad(seconds)}</strong>
            <small>Giây</small>
          </span>
        </div>

        <button type="button" className="vg-offer-cta" onClick={openLead}>
          Nhận Ưu Đãi
        </button>

        <button
          type="button"
          className="vg-offer-close"
          onClick={dismiss}
          aria-label="Đóng thông báo ưu đãi"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
