import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Cho các khối nội dung hiện dần lên khi cuộn tới.
 *
 * Dùng IntersectionObserver thay cho thư viện WOW.js của template cũ: không cần
 * jQuery, và chỉ tính toán khi phần tử thực sự vào tầm nhìn chứ không nghe sự
 * kiện scroll liên tục.
 *
 * Phần tử chỉ hiện một lần rồi thôi — cuộn lên cuộn xuống mà cứ ẩn hiện lại thì
 * rối mắt. Người dùng bật "giảm chuyển động" thì bỏ qua hoàn toàn.
 */

/** Các khối được chọn để hiện dần, kèm độ trễ xếp lớp theo thứ tự trong hàng. */
const TARGETS = [
  '.sec-title',
  '.sec-title2',
  '.sec-title3',
  '.vg-schedule-box',
  '.about-part',
  '.vg-cert-box',
  '.courses-item',
  '.rs-addon-services',
  '.vg-format-card',
  '.vg-roadmap-section .col-lg-4',
  '.team-item',
  '.testimonial-item',
  '.blog-item',
  '.vg-schedule-list li',
  '.rs-categories .categories-item',
  '.vg-test-meta-box',
  '.vg-section-score',
  '.footer-widget',
]

export default function ScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const nodes = document.querySelectorAll(TARGETS.join(','))
    if (!nodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('vg-revealed')
          observer.unobserve(entry.target)
        }
      },
      // Chờ khối lộ ra 18% và cách đáy màn hình 120px mới chạy. Ngưỡng cao hơn
      // bản trước để người xem thấy rõ chuyển động thay vì khối đã hiện sẵn.
      { threshold: 0.18, rootMargin: '0px 0px -120px 0px' },
    )

    nodes.forEach((node, i) => {
      // Thẻ nằm trong carousel thì bỏ qua: Swiper giữ các slide ngoài khung ở
      // trạng thái ẩn nên observer không bao giờ kích hoạt, thẻ sẽ kẹt mờ mãi.
      if (node.closest('.swiper')) return

      node.classList.add('vg-reveal')
      // Thẻ cùng hàng hiện lần lượt, cách nhau 140ms để thấy rõ thứ tự thay vì
      // cả hàng bật lên cùng lúc.
      node.style.setProperty('--vg-reveal-delay', `${(i % 4) * 140}ms`)

      // Khối đã nằm sẵn trong tầm nhìn khi vào trang thì hiện luôn, không chờ cuộn.
      const rect = node.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        node.classList.add('vg-revealed')
      } else {
        observer.observe(node)
      }
    })

    return () => observer.disconnect()
  }, [pathname])

  return null
}
