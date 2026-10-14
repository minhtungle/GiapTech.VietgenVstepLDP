import nodemailer from 'nodemailer'

/**
 * Máy chủ OneMail trì hoãn khoảng 30 giây trước khi gửi xong lời chào
 * (kỹ thuật chống spam), và từ chối khi nhận nhiều kết nối dồn dập.
 * Vì vậy timeout để rộng và có cơ chế thử lại.
 */
const SMTP_TIMEOUT_MS = 90_000
const MAX_ATTEMPTS = 3

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('Thiếu cấu hình SMTP (SMTP_HOST / SMTP_USER / SMTP_PASS)')
  }

  const port = Number(process.env.SMTP_PORT || 465)

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 dùng SSL ngầm, các cổng khác dùng STARTTLS
    auth: { user, pass },
    name: 'vietgeneducation.edu.vn',
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    pool: false,
  })

  return transporter
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Gửi mail, thử lại vài lần vì máy chủ hay ngắt kết nối khi bận. */
export async function sendMail({ to, subject, text, replyTo }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  let lastError = null

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(3000 * attempt)
    try {
      return await getTransporter().sendMail({
        from: `VietGen Website <${from}>`,
        to,
        subject,
        text,
        replyTo,
      })
    } catch (err) {
      lastError = err
    }
  }

  throw lastError
}

export const RECIPIENT = 'tuyensinh.vstep@vietgeneducation.edu.vn'
