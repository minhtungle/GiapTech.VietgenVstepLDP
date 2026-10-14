import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { sendMail, RECIPIENT } from './mailer.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT || 3101)

app.use(express.json({ limit: '256kb' }))
app.use(express.urlencoded({ extended: true, limit: '256kb' }))

/** Cắt bỏ ký tự xuống dòng để không ai chèn thêm header vào email. */
function clean(value, maxLength = 200) {
  return String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

/** Form đăng ký tư vấn. */
app.post('/api/register', async (req, res) => {
  const name = clean(req.body.name)
  const email = clean(req.body.email)
  const phone = clean(req.body.phone, 40)
  const course = clean(req.body.course)
  const region = clean(req.body.region, 60)
  const message = clean(req.body.message, 2000)

  if (!name || !phone || !isValidEmail(email)) {
    return res
      .status(400)
      .json({ ok: false, message: 'Vui lòng nhập đầy đủ họ tên, email và số điện thoại hợp lệ.' })
  }

  const lines = [
    `Họ và tên: ${name}`,
    `Email: ${email}`,
    `Số điện thoại: ${phone}`,
  ]
  if (course) lines.push(`Chứng chỉ cần: ${course}`)
  if (region) lines.push(`Khu vực: ${region}`)
  if (message) lines.push('', `Nội dung:`, message)
  lines.push('', '--', 'Gửi tự động từ form đăng ký trên website VietGen.')

  try {
    await sendMail({
      to: RECIPIENT,
      subject: `Đăng ký test đầu vào VSTEP - ${name}`,
      text: lines.join('\n'),
      replyTo: `${name} <${email}>`,
    })
    res.json({ ok: true, message: 'Cảm ơn bạn! VietGen sẽ liên hệ tư vấn trong thời gian sớm nhất.' })
  } catch (err) {
    console.error('[register] Gửi mail thất bại:', err.message)
    res.status(500).json({
      ok: false,
      message: 'Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline 0866.538.942.',
    })
  }
})

/**
 * Kết quả bài test: gửi kết quả cho học viên và thông tin lead cho trung tâm.
 * Mail nội bộ hỏng thì chỉ ghi log, vì học viên đã làm xong bài và cần xem điểm.
 */
app.post('/api/test-result', async (req, res) => {
  const name = clean(req.body.name)
  const email = clean(req.body.email)
  const phone = clean(req.body.phone, 40)
  const course = clean(req.body.course)
  const region = clean(req.body.region, 60)

  const score = clean(req.body.score, 40)
  const percent = clean(req.body.percent, 20)
  const level = clean(req.body.level, 120)
  // Nội dung do trình duyệt gửi lên: giữ xuống dòng nhưng bỏ ký tự điều khiển khác.
  const summary = String(req.body.summary ?? '')
    .replace(/[^\P{C}\n]+/gu, '')
    .slice(0, 5000)

  if (!name || !phone || !isValidEmail(email)) {
    return res
      .status(400)
      .json({ ok: false, message: 'Vui lòng nhập đầy đủ họ tên, email và số điện thoại hợp lệ.' })
  }

  const studentBody = [
    `Chào ${name},`,
    '',
    'Cảm ơn bạn đã hoàn thành bài test trình độ tiếng Anh của VietGen.',
    'Dưới đây là kết quả của bạn:',
    '',
    '========================================',
    summary,
    '========================================',
    '',
    'Lưu ý: bài test này đánh giá Ngữ pháp, Từ vựng và Đọc hiểu.',
    'Hai kỹ năng Speaking và Writing sẽ được giáo viên kiểm tra trực tiếp',
    'khi bạn tham gia buổi test đầu vào tại trung tâm.',
    '',
    `Tư vấn viên của VietGen sẽ liên hệ với bạn qua số ${phone}`,
    'để trao đổi về lộ trình học phù hợp.',
    '',
    'Mọi thắc mắc xin liên hệ:',
    'Hotline: 0866.538.942',
    `Email: ${RECIPIENT}`,
    '',
    'Trân trọng,',
    'VietGen Language Education',
  ].join('\n')

  let studentSent = false
  try {
    await sendMail({
      to: email,
      subject: 'Kết quả test trình độ tiếng Anh của bạn - VietGen',
      text: studentBody,
      replyTo: `VietGen <${RECIPIENT}>`,
    })
    studentSent = true
  } catch (err) {
    console.error('[test-result] Gửi mail học viên thất bại:', err.message)
  }

  const adminLines = [
    'Học viên vừa hoàn thành bài test trình độ trên website.',
    '',
    'THÔNG TIN LIÊN HỆ',
    `Họ và tên: ${name}`,
    `Email: ${email}`,
    `Số điện thoại: ${phone}`,
  ]
  if (course) adminLines.push(`Chứng chỉ cần: ${course}`)
  if (region) adminLines.push(`Khu vực: ${region}`)
  adminLines.push(
    '',
    'KẾT QUẢ BÀI TEST',
    `Điểm: ${score} (${percent})`,
    `Trình độ: ${level}`,
    '',
    summary,
    '',
    `Email kết quả gửi cho học viên: ${studentSent ? 'thành công' : 'THẤT BẠI'}`,
    '',
    '--',
    'Gửi tự động từ trang test trình độ trên website VietGen.',
  )

  try {
    await sendMail({
      to: RECIPIENT,
      subject: `Kết quả test trình độ - ${name} (${score})`,
      text: adminLines.join('\n'),
      replyTo: `${name} <${email}>`,
    })
  } catch (err) {
    console.error('[test-result] Gửi mail nội bộ thất bại:', err.message)
  }

  if (studentSent) {
    res.json({ ok: true, message: 'Đã gửi kết quả vào email của bạn.' })
  } else {
    res.status(500).json({ ok: false, message: 'Không gửi được email kết quả.' })
  }
})

// Phục vụ bản build của React và trả index.html cho mọi đường dẫn (SPA routing).
const distDir = path.join(__dirname, '..', 'dist')
app.use(express.static(distDir))
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`[server] Đang chạy tại http://localhost:${PORT}`)
})
