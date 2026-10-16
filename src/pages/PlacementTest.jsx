import { useState, useEffect, useMemo, useCallback } from 'react'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import { useLeadPopup } from '../App.jsx'
import { getJSON, postJSON } from '../lib/api.js'
import { buildQuiz, mergeSections } from '../lib/quiz.js'
import { COURSE_OPTIONS, REGIONS } from '../data/site.js'

const STAGES = { INTRO: 'intro', QUIZ: 'quiz', GATE: 'gate', RESULT: 'result' }

/** Gộp các phần đề thành một danh sách câu hỏi phẳng để chấm điểm. */
function flattenQuestions(sections) {
  const out = []
  for (const section of sections) {
    if (section.type === 'reading') {
      for (const passage of section.passages ?? []) {
        for (const q of passage.questions ?? []) {
          // Kèm luôn đoạn văn: khi làm từng câu một, học viên cần thấy đoạn đọc
          // ngay bên cạnh câu hỏi chứ không phải cuộn ngược lên tìm.
          out.push({
            ...q,
            type: 'multiple_choice',
            sectionId: section.id,
            sectionTitle: section.title,
            passageId: passage.id,
            passageTitle: passage.title,
            passageText: passage.text,
          })
        }
      }
    } else {
      for (const q of section.questions ?? []) {
        out.push({ ...q, type: section.type, sectionId: section.id, sectionTitle: section.title })
      }
    }
  }
  return out
}

/** Đáp án điền khuyết: bỏ qua hoa thường và khoảng trắng thừa. */
function isBlankCorrect(question, value) {
  if (!value) return false
  const normalized = String(value).trim().toLowerCase()
  const accepted = Array.isArray(question.answer) ? question.answer : [question.answer]
  return accepted.some((a) => String(a).trim().toLowerCase() === normalized)
}

export default function PlacementTest() {
  const openLead = useLeadPopup()

  const [config, setConfig] = useState(null)
  const [sections, setSections] = useState([])
  const [loadError, setLoadError] = useState(false)

  const [stage, setStage] = useState(STAGES.INTRO)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [score, setScore] = useState(null)
  const [region, setRegion] = useState(REGIONS[0])
  const [sending, setSending] = useState(false)
  const [mailNote, setMailNote] = useState('')

  const questions = useMemo(() => flattenQuestions(sections), [sections])
  const answeredCount = Object.keys(answers).length

  useEffect(() => {
    let cancelled = false
    getJSON('/data/test-config.json')
      .then(async (cfg) => {
        // Nạp mọi file đề rồi gộp các phần cùng tên thành một ngân hàng chung.
        // Thiếu file nào thì bỏ qua file đó, không làm hỏng cả bài test.
        const loaded = await Promise.all(
          cfg.sections.map((url) =>
            getJSON('/' + url.replace(/^\//, '')).catch(() => null),
          ),
        )
        if (cancelled) return

        const bank = mergeSections(loaded.filter(Boolean).map((x) => [x]))
        if (!bank.length) throw new Error('Ngân hàng câu hỏi rỗng')

        setConfig(cfg)
        setSections(buildQuiz(bank, cfg.blueprint || {}, cfg.level_ratios))
      })
      .catch(() => !cancelled && setLoadError(true))
    return () => {
      cancelled = true
    }
  }, [])

  const computeScore = useCallback(() => {
    let correct = 0
    const bySection = {}
    const detail = []

    for (const q of questions) {
      bySection[q.sectionId] ??= { title: q.sectionTitle, correct: 0, total: 0 }
      bySection[q.sectionId].total++

      const given = answers[q.id]
      const ok = q.type === 'fill_blank' ? isBlankCorrect(q, given) : given === q.answer
      if (ok) {
        correct++
        bySection[q.sectionId].correct++
      }
      detail.push({ ...q, given, ok })
    }

    const total = questions.length
    const percent = total ? Math.round((correct / total) * 100) : 0

    // Lấy bậc cao nhất mà điểm phần trăm đạt được.
    let level = config.levels[0]
    for (const lv of config.levels) if (percent >= lv.min_percent) level = lv

    return { correct, total, percent, level, bySection, detail }
  }, [questions, answers, config])

  const goToGate = useCallback(() => {
    setScore(computeScore())
    setStage(STAGES.GATE)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [computeScore])

  // Đồng hồ đếm ngược; hết giờ thì tự nộp bài.
  useEffect(() => {
    if (stage !== STAGES.QUIZ) return
    if (secondsLeft <= 0) {
      goToGate()
      return
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [stage, secondsLeft, goToGate])

  function startTest() {
    setCurrent(0)
    setSecondsLeft((config?.duration_minutes ?? 25) * 60)
    setStage(STAGES.QUIZ)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmitClick() {
    if (answeredCount < questions.length && !confirmSubmit) {
      setConfirmSubmit(true)
      return
    }
    goToGate()
  }

  function buildSummary(s) {
    const lines = [
      `Điểm: ${s.correct}/${s.total} câu đúng (${s.percent}%)`,
      `Trình độ ước lượng: ${s.level.label}`,
      '',
      'Chi tiết theo phần:',
      ...Object.values(s.bySection).map((x) => `- ${x.title}: ${x.correct}/${x.total}`),
      '',
      `Nhận xét: ${s.level.summary}`,
      `Lời khuyên: ${s.level.advice}`,
      `Khóa học gợi ý: ${s.level.course}`,
    ]
    return lines.join('\n')
  }

  async function handleGateSubmit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))

    setSending(true)
    try {
      const res = await postJSON('/api/test-result', {
        ...data,
        region,
        score: `${score.correct}/${score.total}`,
        percent: `${score.percent}%`,
        level: score.level.label,
        summary: buildSummary(score),
      })
      setMailNote(
        res.ok
          ? 'Kết quả chi tiết đã được gửi tới email của bạn.'
          : 'Không gửi được email kết quả, nhưng bạn vẫn xem được điểm bên dưới. VIETGEN sẽ liên hệ với bạn qua số điện thoại.',
      )
    } catch {
      setMailNote(
        'Không gửi được email kết quả, nhưng bạn vẫn xem được điểm bên dưới. VIETGEN sẽ liên hệ với bạn qua số điện thoại.',
      )
    } finally {
      setSending(false)
      setStage(STAGES.RESULT)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  return (
    <>
      <Seo
        title="Test Trình Độ Tiếng Anh Miễn Phí - VIETGEN VSTEP"
        description="Làm bài test trình độ tiếng Anh miễn phí theo khung VSTEP. Ngữ pháp, từ vựng, đọc hiểu. Nhận kết quả và lộ trình học phù hợp ngay."
      />
      <Breadcrumbs
        title="Test Trình Độ Tiếng Anh"
        subText="Miễn phí - Biết ngay trình độ và lộ trình phù hợp"
      />

      <div className="rs-services-style2 pt-80 pb-80 md-pt-60 md-pb-60">
        <div className="container">
          {loadError && (
            <div className="vg-test-error">
              Không tải được nội dung bài test. Vui lòng tải lại trang hoặc gọi hotline 0866.538.942.
            </div>
          )}

          {!loadError && !config && <div className="vg-test-intro">Đang tải bài test...</div>}

          {config && stage === STAGES.INTRO && (
            <IntroPanel config={config} total={questions.length} onStart={startTest} />
          )}

          {config && stage === STAGES.QUIZ && (
            <QuizPanel
              questions={questions}
              current={current}
              setCurrent={setCurrent}
              answers={answers}
              setAnswers={setAnswers}
              answeredCount={answeredCount}
              total={questions.length}
              timer={`${minutes}:${seconds}`}
              timerLow={secondsLeft <= 120}
              onSubmit={handleSubmitClick}
              warning={
                confirmSubmit && answeredCount < questions.length
                  ? `Bạn còn ${questions.length - answeredCount} câu chưa làm. Bấm lần nữa để nộp bài.`
                  : ''
              }
            />
          )}

          {stage === STAGES.GATE && (
            <GatePanel
              region={region}
              setRegion={setRegion}
              sending={sending}
              onSubmit={handleGateSubmit}
            />
          )}

          {stage === STAGES.RESULT && score && (
            <ResultPanel score={score} mailNote={mailNote} onOpenLead={openLead} />
          )}
        </div>
      </div>
    </>
  )
}

function IntroPanel({ config, total, onStart }) {
  return (
    <div className="vg-test-panel">
      <div className="vg-test-intro">
        <h2 className="vg-test-heading">Bạn đang ở trình độ nào?</h2>
        <p className="vg-test-lead">
          Bài test gồm <strong>{total}</strong> câu hỏi về ngữ pháp, từ vựng và đọc hiểu, được biên
          soạn theo khung năng lực ngoại ngữ 6 bậc dùng cho VSTEP. Kết quả giúp bạn biết mình đang ở
          đâu và nên bắt đầu từ khóa học nào.
        </p>

        <div className="row vg-test-meta">
          {[
            [total, 'Câu hỏi'],
            [config.duration_minutes, 'Phút làm bài'],
            [config.sections.length, 'Phần thi'],
            ['0đ', 'Hoàn toàn miễn phí'],
          ].map(([value, label]) => (
            <div className="col-md-3 col-6" key={label}>
              <div className="vg-test-meta-box">
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </div>
          ))}
        </div>

        <ul className="vg-test-notes">
          <li>
            <i className="fa fa-check" /> Phần 1 &amp; 3 là trắc nghiệm, phần 2 là điền từ vào chỗ
            trống.
          </li>
          <li>
            <i className="fa fa-check" /> Bài test đánh giá Ngữ pháp - Từ vựng - Đọc hiểu. Speaking
            và Writing sẽ được giáo viên kiểm tra khi bạn tới lớp.
          </li>
          <li>
            <i className="fa fa-check" /> Cuối bài bạn để lại thông tin để nhận kết quả chi tiết qua
            email.
          </li>
        </ul>

        <button type="button" className="readon banner-style uppercase" onClick={onStart}>
          Bắt Đầu Làm Bài
        </button>
      </div>
    </div>
  )
}

function QuizPanel({
  questions, answers, setAnswers, answeredCount, total, timer, timerLow,
  onSubmit, warning, current, setCurrent,
}) {
  const progress = total ? Math.round((answeredCount / total) * 100) : 0
  const q = questions[current]
  if (!q) return null

  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))
  const clearAnswer = (id) =>
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })

  const go = (index) => {
    if (index < 0 || index >= total) return
    setCurrent(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Câu đọc hiểu kế tiếp cùng một đoạn văn thì không lặp lại đoạn đó.
  const prevQ = questions[current - 1]
  const showPassage = q.passageText && (!prevQ || prevQ.passageId !== q.passageId)

  const isAnswered = (item) => {
    const v = answers[item.id]
    return item.type === 'fill_blank' ? Boolean(v && String(v).trim()) : v !== undefined
  }

  return (
    <div className="vg-test-panel">
      <div className="vg-test-progress-bar">
        <div className="vg-test-progress-info">
          <span>
            Câu {current + 1}/{total} · đã làm {answeredCount}
          </span>
          <span className={`vg-test-timer${timerLow ? ' vg-timer-low' : ''}`}>
            <i className="fa fa-clock-o" /> {timer}
          </span>
        </div>
        <div className="vg-test-progress-track">
          <div className="vg-test-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 md-mb-30">
          <div className="vg-test-section-head vg-test-section-head-sm">
            <h3>{q.sectionTitle}</h3>
          </div>

          {showPassage && (
            <div className="vg-test-passage">
              <h4>{q.passageTitle}</h4>
              <p>{q.passageText}</p>
            </div>
          )}

          {q.type === 'fill_blank' ? (
            <BlankCard
              q={q}
              index={current + 1}
              value={answers[q.id] ?? ''}
              onChange={(v) => (v.trim() ? setAnswer(q.id, v) : clearAnswer(q.id))}
            />
          ) : (
            <ChoiceCard
              q={q}
              index={current + 1}
              value={answers[q.id]}
              onChange={(v) => setAnswer(q.id, v)}
            />
          )}

          <div className="vg-test-nav">
            <button
              type="button"
              className="vg-test-nav-btn"
              onClick={() => go(current - 1)}
              disabled={current === 0}
            >
              <i className="fa fa-angle-left" /> Câu trước
            </button>

            {current < total - 1 ? (
              <button type="button" className="vg-test-nav-btn vg-test-nav-next" onClick={() => go(current + 1)}>
                Câu sau <i className="fa fa-angle-right" />
              </button>
            ) : (
              <button type="button" className="readon banner-style uppercase" onClick={onSubmit}>
                Nộp Bài &amp; Xem Kết Quả
              </button>
            )}
          </div>

          {warning && <p className="vg-test-warn">{warning}</p>}
        </div>

        <div className="col-lg-4">
          <div className="vg-test-map">
            <h4 className="vg-test-map-title">Danh sách câu hỏi</h4>
            <div className="vg-test-map-grid">
              {questions.map((item, i) => {
                const classes = [
                  'vg-test-map-cell',
                  isAnswered(item) ? 'vg-map-done' : '',
                  i === current ? 'vg-map-current' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={classes}
                    onClick={() => go(i)}
                    aria-label={`Câu ${i + 1}${isAnswered(item) ? ' - đã làm' : ' - chưa làm'}`}
                    aria-current={i === current ? 'true' : undefined}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <ul className="vg-test-map-legend">
              <li>
                <span className="vg-legend-box vg-map-done" /> Đã làm ({answeredCount})
              </li>
              <li>
                <span className="vg-legend-box" /> Chưa làm ({total - answeredCount})
              </li>
              <li>
                <span className="vg-legend-box vg-map-current" /> Câu hiện tại
              </li>
            </ul>

            <button type="button" className="vg-popup-submit vg-test-map-submit" onClick={onSubmit}>
              NỘP BÀI
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChoiceCard({ q, index, value, onChange }) {
  return (
    <div className={`vg-question-card${value !== undefined ? ' vg-answered' : ''}`} data-qid={q.id}>
      <div className="vg-question-title">
        <span className="vg-question-num">{index}</span>
        {q.question}
      </div>
      <div className="vg-question-options">
        {q.options.map((opt, i) => (
          <label className="vg-option" key={i} htmlFor={`opt-${q.id}-${i}`}>
            <input
              type="radio"
              id={`opt-${q.id}-${i}`}
              name={`q-${q.id}`}
              checked={value === i}
              onChange={() => onChange(i)}
            />
            <span className="vg-option-marker">{String.fromCharCode(65 + i)}</span>
            <span className="vg-option-text">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function BlankCard({ q, index, value, onChange }) {
  return (
    <div className={`vg-question-card${value ? ' vg-answered' : ''}`} data-qid={q.id}>
      <div className="vg-question-title">
        <span className="vg-question-num">{index}</span>
        {q.question}
      </div>
      <div className="vg-blank-wrap">
        <input
          type="text"
          className="vg-blank-input"
          autoComplete="off"
          placeholder="Nhập từ còn thiếu"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {q.hint && <span className="vg-blank-hint">Gợi ý: {q.hint}</span>}
      </div>
    </div>
  )
}

function GatePanel({ region, setRegion, sending, onSubmit }) {
  return (
    <div className="vg-test-panel">
      <div className="vg-test-gate">
        <h3 className="vg-test-gate-title">Bạn đã hoàn thành bài test</h3>
        <p className="vg-test-gate-desc">
          Nhập thông tin bên dưới để xem điểm số, trình độ ước lượng và đáp án chi tiết. Kết quả cũng
          sẽ được gửi vào email của bạn.
        </p>

        <form className="vg-test-gate-form" onSubmit={onSubmit}>
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

          <input type="text" name="name" placeholder="Họ và tên" required />
          <input type="tel" name="phone" placeholder="Số điện thoại" required />
          <input type="email" name="email" placeholder="Email nhận kết quả" required />
          <select name="course" defaultValue="">
            <option value="">Chứng chỉ bạn cần</option>
            {COURSE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button type="submit" className="vg-popup-submit" disabled={sending}>
            {sending ? 'ĐANG CHẤM BÀI...' : 'XEM KẾT QUẢ CỦA TÔI'}
          </button>
        </form>

        <div className="vg-popup-note">
          <i className="fa fa-shield" /> Thông tin của bạn được bảo mật tuyệt đối
        </div>
      </div>
    </div>
  )
}

function ResultPanel({ score, mailNote, onOpenLead }) {
  return (
    <div className="vg-test-panel">
      <div className="vg-test-score-card">
        <div className="row y-middle">
          <div className="col-lg-4 text-center md-mb-30">
            <div className="vg-score-circle">
              <span>{score.percent}%</span>
              <small>
                {score.correct}/{score.total} câu đúng
              </small>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="vg-score-level">{score.level.label}</div>
            <p className="vg-score-summary">{score.level.summary}</p>
            <p className="vg-score-advice">{score.level.advice}</p>
            <div className="vg-score-course">
              <i className="fa fa-graduation-cap" />
              <span>
                Khóa học gợi ý: <strong>{score.level.course}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row vg-section-scores">
        {Object.entries(score.bySection).map(([key, s]) => {
          const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0
          return (
            <div className="col-lg-4 col-md-6 md-mb-20" key={key}>
              <div className="vg-section-score">
                <h5>{s.title}</h5>
                <div className="vg-section-bar">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <strong>
                  {s.correct}/{s.total}
                </strong>{' '}
                câu đúng
              </div>
            </div>
          )
        })}
      </div>

      <div className="vg-test-cta">
        {mailNote && <p className="vg-mail-note">{mailNote}</p>}
        <button type="button" className="readon banner-style uppercase" onClick={onOpenLead}>
          Đăng Ký Tư Vấn Lộ Trình
        </button>
      </div>

      <h3 className="vg-review-heading">Đáp án chi tiết</h3>
      <div className="vg-review-body">
        {score.detail.map((q, i) => {
          const accepted = Array.isArray(q.answer) ? q.answer : [q.answer]
          const yourAnswer =
            q.type === 'fill_blank'
              ? q.given || null
              : typeof q.given === 'number'
                ? q.options[q.given]
                : null
          const right = q.type === 'fill_blank' ? accepted.join(' / ') : q.options[q.answer]

          return (
            <div className={`vg-review-item ${q.ok ? 'vg-review-ok' : 'vg-review-bad'}`} key={q.id}>
              <div className="vg-review-head">
                <span className="vg-review-num">Câu {i + 1}</span>
                <span className="vg-review-badge">
                  <i className={`fa ${q.ok ? 'fa-check' : 'fa-times'}`} /> {q.ok ? 'Đúng' : 'Sai'}
                </span>
              </div>
              <div className="vg-review-q">{q.question}</div>
              <div className="vg-review-line">
                <span>Bạn trả lời:</span>{' '}
                {yourAnswer ?? <em>{q.type === 'fill_blank' ? 'Bỏ trống' : 'Chưa chọn'}</em>}
              </div>
              {!q.ok && (
                <div className="vg-review-line vg-review-right">
                  <span>Đáp án đúng:</span> {right}
                </div>
              )}
              {q.explanation && (
                <div className="vg-review-explain">
                  <i className="fa fa-lightbulb-o" /> {q.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="text-center mt-40">
        <button
          type="button"
          className="readon banner-style uppercase"
          onClick={() => window.location.reload()}
        >
          Làm Lại Bài Test
        </button>
      </div>
    </div>
  )
}
