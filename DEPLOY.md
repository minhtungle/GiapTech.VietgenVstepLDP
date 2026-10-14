# Deploy lên VPS

Website chạy bằng React (Vite) + API Node, đóng gói trong một container Docker.

> Không dán mật khẩu vào prompt. Gõ trực tiếp vào `.env` trên VPS qua SSH.

## Chạy nhanh

```bash
git clone https://github.com/minhtungle/GiapTech.VietgenVstepLDP.git
cd GiapTech.VietgenVstepLDP

cp .env.example .env
chmod 600 .env        # rồi điền SMTP_PASS

docker compose up -d --build
```

Mặc định site chạy ở `127.0.0.1:8000`. Đổi bằng `WEB_PORT` trong `.env`.

## Cấu hình `.env`

```
WEB_PORT=8000
SMTP_HOST=mail.vietgeneducation.edu.vn
SMTP_PORT=465
SMTP_USER=tuyensinh.vstep@vietgeneducation.edu.vn
SMTP_PASS=<mật khẩu hộp thư>
SMTP_FROM=tuyensinh.vstep@vietgeneducation.edu.vn
```

`SMTP_HOST` **bắt buộc** là `mail.vietgeneducation.edu.vn`. Không dùng `mail.inet.vn`:
tuy cùng trỏ về IP 103.57.220.204 nhưng máy chủ phân biệt tenant theo hostname, dùng
sai sẽ bị từ chối đăng nhập với lỗi `535 authentication failed`.

## Kiểm tra sau khi chạy

```bash
docker compose ps
curl -s http://127.0.0.1:8000/api/health            # {"ok":true}
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/tin-tuc/chi-tiet

# Thử gửi mail thật (mất khoảng 1 phút)
curl -s -m 280 -X POST http://127.0.0.1:8000/api/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Deploy","email":"test@example.com","phone":"0900000000","region":"Hà Nội"}'
```

Sau đó trỏ reverse proxy (Nginx/Caddy) vào `127.0.0.1:8000` kèm HTTPS. Container cố
ý chỉ bind vào localhost, không mở thẳng ra Internet.

## Phát triển tại máy

```bash
npm install
npm run server      # API Node, cổng 3101
npm run dev         # Vite dev server, cổng 5173, tự proxy /api sang 3101
```

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `src/pages/` | Các trang: Home, About, Courses, Teachers, Blog, Contact, PlacementTest... |
| `src/components/` | Header, Footer, LeadPopup, Breadcrumbs... |
| `src/data/content.js` | Toàn bộ nội dung marketing (sửa chữ nghĩa tại đây) |
| `src/data/site.js` | Thông tin liên hệ, menu, danh sách khóa học |
| `src/styles/` | CSS của template gốc |
| `public/data/` | Bộ đề bài test trình độ (JSON) |
| `server/` | API Node: `/api/register`, `/api/test-result` |
| `legacy-html/` | Bản HTML + PHP cũ, giữ để đối chiếu |

## Xử lý sự cố

- **Form trả lỗi 500** = gửi mail thất bại. Xem log: `docker compose logs --tail 50`
- **`535 authentication failed`** → sai `SMTP_HOST` (xem trên) hoặc sai mật khẩu.
- **Chờ khoảng 30 giây mới xong là bình thường**: máy chủ mail cố tình trì hoãn lời
  chào để chống spam. Timeout trong code để 90s, đừng giảm.
- **VPS chặn cổng ra 465** → mở firewall egress tới `103.57.220.204:465`.

## Quay lại bản HTML cũ

Bản HTML tĩnh + PHP đã được gắn tag trước khi chuyển sang React:

```bash
git checkout stable-html-v1
```

Bản đó chạy bằng Nginx + PHP-FPM, xem `legacy-html/` để biết cấu hình.
