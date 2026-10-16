import { useState, useEffect, useMemo } from 'react'

/**
 * Tiêu đề banner gõ từng chữ một, có tô sáng các từ khoá.
 *
 * Chữ được dựng sẵn ở dạng ẩn để giữ nguyên chiều cao khối ngay từ đầu, nhờ
 * vậy phần nội dung bên dưới không bị đẩy lên đẩy xuống trong lúc gõ.
 *
 * Người dùng bật "giảm chuyển động" thì hiện luôn toàn bộ, không gõ.
 */
export default function TypingTitle({ text, highlights = [], speed = 55, startDelay = 300 }) {
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

  useEffect(() => {
    if (calm || !text) {
      setShown(text?.length || 0)
      setDone(true)
      return
    }

    setShown(0)
    setDone(false)

    let i = 0
    let timer
    const start = setTimeout(function step() {
      i += 1
      setShown(i)
      if (i < text.length) {
        timer = setTimeout(step, speed)
      } else {
        setDone(true)
      }
    }, startDelay)

    return () => {
      clearTimeout(start)
      clearTimeout(timer)
    }
  }, [text, speed, startDelay, calm])

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
        {!done && <span className="vg-type-caret" aria-hidden="true" />}
      </span>
    </>
  )
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
