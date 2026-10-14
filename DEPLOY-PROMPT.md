# Prompt deploy lên VPS

Dán toàn bộ phần dưới dấu `---` vào phiên Claude Code chạy trên VPS.

> Không dán mật khẩu vào prompt. Gõ trực tiếp vào `.env` trên VPS qua SSH.

---

Deploy phiên bản React mới của website VietGen VSTEP lên VPS này, chạy một lượt
tới khi hoàn chỉnh.

## Bối cảnh

Repo: `https://github.com/minhtungle/GiapTech.VietgenVstepLDP`, nhánh `main`.

Dự án vừa chuyển từ **HTML tĩnh + PHP** sang **React (Vite) + API Node**. Kiến trúc
đổi hoàn toàn:

| | Bản cũ | Bản mới |
|---|---|---|
| Giao diện | HTML + jQuery | React 18 + Vite |
| Backend | PHP (`mailer.php`, `test-result.php`) | Node + Express (`server/`) |
| Container | Nginx + PHP-FPM | Chỉ Node |
| Cổng trong container | 80 | 3101 |
| Cổng công khai | `127.0.0.1:8000` | `127.0.0.1:8000` (không đổi) |

Các file PHP và HTML cũ nay nằm trong `legacy-html/`, giữ để đối chiếu.

Website có hai chức năng gửi mail, cả hai đều phải chạy được sau khi deploy:
- Form đăng ký tư vấn: gửi thông tin về trung tâm **và** mail xác nhận cho khách
- Bài test trình độ: gửi kết quả cho học viên **và** thông tin lead cho trung tâm

## Các bước

### 1. Lấy code mới

```bash
cd <thư mục dự án>
git fetch origin
git log --oneline -1 origin/main      # xem commit mới nhất
git pull origin main
```

Nếu `git pull` báo xung đột với file đang có trên VPS, dừng lại và báo tôi, đừng
tự ghi đè.

### 2. Kiểm tra `.env`

File `.env` **không nằm trong repo** (cố ý, vì chứa mật khẩu). Nếu VPS đã deploy
bản cũ thì file này đã có sẵn và **giữ nguyên, không cần sửa** — các biến giống
hệt bản cũ.

Nếu chưa có, tạo từ mẫu rồi dừng lại để tôi điền mật khẩu:

```bash
cp .env.example .env
chmod 600 .env
```

Nội dung cần có:

```
WEB_PORT=8000
SMTP_HOST=mail.vietgeneducation.edu.vn
SMTP_PORT=465
SMTP_USER=tuyensinh.vstep@vietgeneducation.edu.vn
SMTP_PASS=<tôi sẽ tự gõ>
SMTP_FROM=tuyensinh.vstep@vietgeneducation.edu.vn
```

`SMTP_HOST` **bắt buộc** là `mail.vietgeneducation.edu.vn`. Không dùng
`mail.inet.vn`: tuy cùng trỏ về IP 103.57.220.204 nhưng máy chủ phân biệt tenant
theo hostname, dùng sai sẽ bị từ chối đăng nhập với lỗi `535 authentication failed`.

### 3. Dừng container cũ và dựng lại

```bash
docker compose down
docker compose up -d --build
```

Lần build đầu mất vài phút vì phải cài gói npm và build Vite.

### 4. Kiểm tra

```bash
docker compose ps                                    # phải Up
docker compose logs --tail 20                        # phải thấy "[server] Đang chạy tại..."

curl -s http://127.0.0.1:8000/api/health             # {"ok":true}

for u in / /test /khoa-hoc /gioi-thieu /giang-vien /tin-tuc /lien-he /tin-tuc/chi-tiet; do
  printf "%-22s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000$u)"
done
```

Tất cả phải trả **200**. Đặc biệt chú ý `/tin-tuc/chi-tiet` (route nhiều cấp) —
nếu trả 404 thì reverse proxy chưa chuyển hết request về app.

### 5. Thử gửi mail thật

Mỗi lệnh mất khoảng 1 phút, **chờ lâu là bình thường** (xem mục Lưu ý).

```bash
# Form đăng ký: phải gửi 2 mail
curl -s -m 280 -X POST http://127.0.0.1:8000/api/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Deploy","email":"minhtungle411@gmail.com","phone":"0900000000","course":"VSTEP B1 Cấp Tốc (9 buổi)","region":"Hà Nội"}'

sleep 15

# Kết quả bài test: cũng gửi 2 mail
curl -s -m 280 -X POST http://127.0.0.1:8000/api/test-result \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Deploy","email":"minhtungle411@gmail.com","phone":"0900000000","score":"24/30","percent":"80%","level":"Trung cao cấp (B2 trở lên)","summary":"Điểm: 24/30 câu đúng (80%)"}'
```

Cả hai phải trả `{"ok":true,...}`. Sau đó kiểm tra `docker compose logs --tail 30`
không có dòng "thất bại".

### 6. Reverse proxy

Cổng công khai vẫn là `127.0.0.1:8000` nên **cấu hình proxy cũ dùng lại được**.
Hãy kiểm tra giúp:

- Xem cấu hình hiện tại (Nginx thường ở `/etc/nginx/sites-enabled/`, Caddy ở
  `/etc/caddy/Caddyfile`), cho tôi biết đang dùng gì và các site khác cấu hình ra sao.
- React dùng định tuyến phía trình duyệt, nên **mọi đường dẫn** phải chuyển về
  app, không được để proxy đi tìm file tĩnh rồi trả 404.
- Kiểm tra từ ngoài vào bằng domain thật, nhất là một route nhiều cấp:
  `curl -I https://<domain>/tin-tuc/chi-tiet` phải trả 200.
- Xác nhận HTTPS còn hạn.

Nếu cần sửa cấu hình proxy, cho tôi xem bản hiện tại trước khi thay đổi.

### 7. Báo cáo

Cho tôi biết: commit đang chạy, kết quả từng bước kiểm tra ở mục 4 và 5, loại
reverse proxy đang dùng, và những gì bạn đã phải sửa.

## Lưu ý khi xử lý sự cố

- **Chờ khoảng 30 giây mỗi lần gửi mail là bình thường.** Máy chủ OneMail cố tình
  trì hoãn lời chào để chống spam. Timeout trong code để 90 giây, có cơ chế thử
  lại 3 lần — **đừng giảm các giá trị này**.
- **API trả 500** nghĩa là gửi mail hỏng. Xem `docker compose logs --tail 50`.
- **`535 authentication failed`** → sai `SMTP_HOST` (xem mục 2) hoặc sai mật khẩu.
- **VPS chặn cổng ra 465** → mở firewall egress tới `103.57.220.204:465`. Thử:
  `nc -z -w5 103.57.220.204 465`
- **Build thất bại vì hết RAM**: bước build Vite khá nặng. Nếu VPS ít RAM, tạo
  swap tạm hoặc build ở máy khác rồi đẩy image lên.
- **Mail vào Spam**: domain hiện có SPF nhưng chưa rõ đã có DKIM/DMARC chưa. Nếu
  khách báo không nhận được mail, kiểm tra thư mục Spam trước khi kết luận lỗi hệ thống.

## Rollback

Bản HTML + PHP cũ đã kiểm thử vẫn còn nguyên:

```bash
git checkout stable-html-v1
docker compose down
docker compose up -d --build
```

Bản đó chạy Nginx + PHP-FPM, cấu hình nằm trong `legacy-html/`.

## Ràng buộc

- Không commit `.env` hay mật khẩu vào git.
- Không in mật khẩu ra màn hình hay log khi chẩn đoán.
- Không sửa code ứng dụng để "chữa cháy" lỗi deploy — báo tôi trước.
