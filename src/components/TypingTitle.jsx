import { useState, useEffect, useMemo } from 'react'

/**
 * Tiêu đề banner gõ từng chữ một, có tô sáng các từ khoá.
 *
 * Chữ được dựng sẵn ở dạng ẩn để giữ nguyên chiều cao khối ngay từ đầu, nhờ
 * vậy phần nội dung bên dưới không bị đẩy lên đẩy xuống trong lúc gõ.
 *
 * Người dùng bật "giảm chuyển động" thì hiện luôn toàn bộ, không gõ.
 */
export default function TypingTitle({
  text,
  highlights = [],
  speed = 55,
  startDelay = 300,
  holdMs = 3000,
  eraseSpeed = 25,
}) {
  const [shown, setShown] = useState(0)
  const [done, setDone] = useState(false)

  const calm = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  // Cắt câu thành các đoạn, đánh dấu đoạn nào là từ khoá cần tô sáng.
  const parts = useMemo(() => {
    if (!text) return []
    if (!highlights.length) return [{ text, mark: false }]

    const pattern = new RegExp(`(${highlights.map(escapeRegExp).join('|')})`, 'g')
    return text
      .split(pattern)
      .filter(Boolean)
      .map((chunk) => ({ text: chunk, mark: highlights.includes(chunk) }))
  }, [text, highlights])

  // Vòng lặp: gõ hết chữ -> giữ nguyên holdMs -> xoá ngược -> gõ lại.
  // Xoá nhanh hơn gõ để người xem không phải chờ lâu ở nhịp nghỉ.
  useEffect(() => {
    if (calm || !text) {
      setShown(text?.length || 0)
      setDone(true)
      return
    }

    setShown(0)
    setDone(false)

    let timer
    let i = 0
    let erasing = false

    function tick() {
      if (!erasing) {
        i += 1
        setShown(i)
        if (i < text.length) {
          timer = setTimeout(tick, speed)
        } else {
          setDone(true)
          erasing = true
          timer = setTimeout(tick, holdMs)
        }
        return
      }

      i -= 1
      setShown(i)
      setDone(false)
      if (i > 0) {
        timer = setTimeout(tick, eraseSpeed)
      } else {
        erasing = false
        timer = setTimeout(tick, speed * 4)
      }
    }

    timer = setTimeout(tick, startDelay)
    return () => clearTimeout(timer)
  }, [text, speed, startDelay, holdMs, eraseSpeed, calm])

  if (!text) return null

  // Dựng từng đoạn, chỉ hiện phần ký tự đã "gõ" tới.
  let consumed = 0
  const rendered = parts.map((part, idx) => {
    const from = consumed
    consumed += part.text.length
    const visible = Math.min(Math.max(shown - from, 0), part.text.length)

    if (visible === 0) return null
    const slice = part.text.slice(0, visible)

    return part.mark ? (
      <span className="vg-type-mark" key={idx}>
        {slice}
      </span>
    ) : (
      <span key={idx}>{slice}</span>
    )
  })

  return (
    <>
      {/* Bản ẩn giữ chỗ để chiều cao khối không đổi trong lúc gõ */}
      <span className="vg-type-ghost" aria-hidden="true">
        {parts.map((p, i) =>
          p.mark ? (
            <span className="vg-type-mark" key={i}>
              {p.text}
            </span>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </span>

      <span className="vg-type-live">
        {rendered}
        {/* Con trỏ luôn hiện trong lúc chạy vòng lặp; chỉ nháy chậm lại ở nhịp
            nghỉ giữa hai lượt gõ cho đỡ sốt ruột. */}
        {!calm && (
          <span
            className={`vg-type-caret${done ? ' vg-type-caret-idle' : ''}`}
            aria-hidden="true"
          />
        )}
      </span>
    </>
  )
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
