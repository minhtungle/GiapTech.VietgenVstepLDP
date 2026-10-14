/** Gọi API dạng JSON. Trả về { ok, message, ... } kể cả khi server trả lỗi. */
export async function postJSON(url, body, { timeoutMs = 180_000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, ...data }
  } finally {
    clearTimeout(timer)
  }
}

export async function getJSON(url) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Không tải được ${url}`)
  return res.json()
}
