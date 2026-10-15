import { useEffect, useRef } from 'react'

/**
 * Con trỏ tuỳ chỉnh: một chấm nhỏ bám sát chuột và một vòng tròn chạy theo sau
 * với độ trễ nhẹ, phình to khi di qua nút hoặc link.
 *
 * Chỉ bật trên thiết bị có chuột thật. Máy cảm ứng không có con trỏ, còn người
 * dùng bật "giảm chuyển động" thì hiệu ứng đuổi theo gây khó chịu.
 *
 * Vị trí được ghi thẳng vào style trong vòng lặp requestAnimationFrame thay vì
 * qua state, để không phải render lại React mỗi lần chuột nhúc nhích.
 */
export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || calm) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.body.classList.add('vg-cursor-on')

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...mouse }
    let visible = false
    let frame

    function onMove(e) {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!visible) {
        visible = true
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
    }

    // Vòng tròn đuổi theo chuột, mỗi khung hình đi được 18% quãng đường còn lại.
    function tick() {
      ringPos.x += (mouse.x - ringPos.x) * 0.18
      ringPos.y += (mouse.y - ringPos.y) * 0.18
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"], .vg-option, .vg-region-tab'

    function onOver(e) {
      if (e.target.closest?.(INTERACTIVE)) ring.classList.add('vg-cursor-hover')
    }
    function onOut(e) {
      if (e.target.closest?.(INTERACTIVE)) ring.classList.remove('vg-cursor-hover')
    }
    const onDown = () => ring.classList.add('vg-cursor-down')
    const onUp = () => ring.classList.remove('vg-cursor-down')

    // Ẩn con trỏ khi chuột rời khỏi cửa sổ, tránh để lại chấm treo ở mép màn hình.
    function onLeave() {
      dot.style.opacity = '0'
      ring.style.opacity = '0'
      visible = false
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseout', onOut, { passive: true })
    document.addEventListener('mousedown', onDown, { passive: true })
    document.addEventListener('mouseup', onUp, { passive: true })
    document.addEventListener('mouseleave', onLeave, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.body.classList.remove('vg-cursor-on')
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="vg-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="vg-cursor-dot" aria-hidden="true" />
    </>
  )
}
