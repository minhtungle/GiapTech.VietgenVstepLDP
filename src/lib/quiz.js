/**
 * Rút đề ngẫu nhiên từ ngân hàng câu hỏi.
 *
 * Mỗi lần làm bài, học viên nhận một đề khác nhau nhưng vẫn giữ nguyên cấu trúc
 * (số câu mỗi phần) và phân bổ độ khó A2/B1/B2, để điểm giữa các lần vẫn so sánh
 * được với nhau.
 */

/** Xáo mảng theo thuật toán Fisher-Yates, không sửa mảng gốc. */
export function shuffle(items) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Lấy `count` phần tử, cố gắng giữ đúng tỉ lệ các bậc trình độ.
 * Thiếu câu ở bậc nào thì bù bằng câu còn lại, nên không bao giờ trả về thiếu.
 */
function pickBalanced(items, count, ratios) {
  if (items.length <= count) return shuffle(items)

  const byLevel = {}
  for (const item of items) {
    const level = item.level || 'B1'
    ;(byLevel[level] ??= []).push(item)
  }

  const picked = []
  const used = new Set()

  for (const [level, ratio] of Object.entries(ratios)) {
    const pool = shuffle(byLevel[level] || [])
    const want = Math.round(count * ratio)
    for (const item of pool.slice(0, want)) {
      picked.push(item)
      used.add(item.id)
    }
  }

  // Bù cho đủ số câu nếu làm tròn bị hụt, hoặc một bậc không đủ câu.
  if (picked.length < count) {
    const rest = shuffle(items.filter((x) => !used.has(x.id)))
    picked.push(...rest.slice(0, count - picked.length))
  }

  return shuffle(picked.slice(0, count))
}

const DEFAULT_RATIOS = { A2: 0.3, B1: 0.4, B2: 0.3 }

/**
 * Dựng một đề từ các phần đã nạp.
 *
 * `blueprint` nói mỗi phần lấy bao nhiêu câu, ví dụ:
 *   { grammar: 12, vocabulary: 9, reading: 9 }
 * Riêng phần đọc hiểu phải lấy trọn cả đoạn văn (không thể tách câu khỏi đoạn),
 * nên ta chọn ngẫu nhiên đủ đoạn để đạt xấp xỉ số câu mong muốn.
 */
export function buildQuiz(sections, blueprint, ratios = DEFAULT_RATIOS) {
  return sections.map((section) => {
    const want = blueprint[section.id]
    if (!want) return section

    if (section.type === 'reading') {
      // Phải lấy trọn cả đoạn (không tách câu khỏi đoạn văn), mà mỗi đoạn có số
      // câu khác nhau, nên chọn tổ hợp đoạn cho tổng số câu sát `want` nhất.
      const passages = shuffle(section.passages || [])
      const chosen = []
      let total = 0

      for (const passage of passages) {
        const size = (passage.questions || []).length
        if (total >= want) break
        // Thà thiếu một câu còn hơn thừa nhiều: chỉ thêm đoạn khi nó đưa tổng
        // lại gần `want` hơn so với việc dừng ở đây.
        if (total > 0 && Math.abs(total + size - want) > Math.abs(total - want)) break
        chosen.push({ ...passage, questions: shuffle(passage.questions || []) })
        total += size
      }

      return { ...section, passages: chosen }
    }

    const questions = pickBalanced(section.questions || [], want, ratios).map((q) =>
      // Xáo luôn thứ tự đáp án để học viên không đoán theo vị trí quen thuộc.
      shuffleOptions(q),
    )
    return { ...section, questions }
  })
}

/** Xáo các lựa chọn của câu trắc nghiệm và cập nhật lại chỉ số đáp án đúng. */
export function shuffleOptions(question) {
  if (!Array.isArray(question.options) || typeof question.answer !== 'number') {
    return question
  }
  const correct = question.options[question.answer]
  const options = shuffle(question.options)
  return { ...question, options, answer: options.indexOf(correct) }
}

/** Gộp các phần cùng id từ nhiều file lại thành một ngân hàng duy nhất. */
export function mergeSections(groups) {
  const merged = new Map()

  for (const section of groups.flat()) {
    const existing = merged.get(section.id)
    if (!existing) {
      merged.set(section.id, {
        ...section,
        questions: [...(section.questions || [])],
        passages: [...(section.passages || [])],
      })
      continue
    }
    existing.questions.push(...(section.questions || []))
    existing.passages.push(...(section.passages || []))
  }

  return [...merged.values()]
}
