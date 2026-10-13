# Deploy lên VPS

Dán toàn bộ nội dung dưới đây vào phiên Claude Code chạy trên VPS.

> Không dán mật khẩu vào prompt. Gõ trực tiếp vào `.env` trên VPS qua SSH.

---

Deploy website landing page VSTEP của VietGen lên VPS này bằng Docker.

Repo: `https://github.com/minhtungle/GiapTech.VietgenVstepLDP` (nhánh `main`). Đây là
landing page tĩnh chạy trong 1 container gộp Nginx + PHP-FPM. Phần PHP duy nhất là form
đăng ký test đầu vào: `mailer.php` nhận POST rồi gửi email qua SMTP bằng `smtp.php`
(SMTP client viết tay, không dùng thư viện ngoài).

Việc cần làm:

1. Clone repo về VPS, hoặc `git pull origin main` nếu đã có sẵn.

2. Tạo file `.env` ở thư mục gốc dự án. File này cố ý không nằm trong repo vì chứa mật
   khẩu, nên phải tạo thủ công; có sẵn `.env.example` làm mẫu. Nội dung:

   ```
   WEB_PORT=15090
   SMTP_HOST=mail.vietgeneducation.edu.vn
   SMTP_PORT=465
   SMTP_USER=tuyensinh.vstep@vietgeneducation.edu.vn
   SMTP_PASS=<tôi sẽ tự gõ mật khẩu vào, bạn để trống chỗ này>
   SMTP_FROM=tuyensinh.vstep@vietgeneducation.edu.vn
   ```

   Đặt quyền `chmod 600 .env`. Dừng lại để tôi điền mật khẩu rồi mới chạy tiếp.

   Lưu ý quan trọng: `SMTP_HOST` bắt buộc là `mail.vietgeneducation.edu.vn`. Không dùng
   `mail.inet.vn` — tuy cùng trỏ về IP 103.57.220.204 nhưng máy chủ phân biệt tenant theo
   hostname, dùng sai sẽ bị từ chối đăng nhập với lỗi `535 authentication failed`.

3. Build và chạy: `docker compose up -d --build`

4. Kiểm tra sau khi chạy:
   - Container `Up`: `docker compose ps`
   - Trang web trả 200: `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:15090/`
   - Health check trả `ok`: `curl http://127.0.0.1:15090/health`
   - Log khởi động có dòng `[entrypoint] SMTP đã cấu hình: ... qua mail.vietgeneducation.edu.vn:465`
   - Validation trả 400 khi thiếu trường:
     `curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:15090/mailer.php -d "name=X"`
   - Gửi thử đơn đăng ký thật, xác nhận mail về hộp thư
     `tuyensinh.vstep@vietgeneducation.edu.vn` (kiểm tra cả spam):

     ```
     curl -s -m 180 -X POST http://127.0.0.1:15090/mailer.php \
       --data-urlencode "name=Test Deploy" \
       --data-urlencode "email=test@example.com" \
       --data-urlencode "phone=0900000000" \
       --data-urlencode "course=VSTEP B2 Cấp Tốc (10 buổi)" \
       --data-urlencode "region=Hà Nội"
     ```

     Kỳ vọng HTTP 200 kèm thông báo "Cảm ơn bạn!...".

5. Cấu hình reverse proxy trỏ domain vào `127.0.0.1:15090`, kèm HTTPS. Container cố ý chỉ
   bind vào localhost, không mở ra ngoài Internet. Trước khi sửa, cho tôi biết VPS đang
   dùng reverse proxy nào và các site khác cấu hình ra sao, để làm cho khớp.

Xử lý sự cố:

- Form trả HTTP 500 nghĩa là gửi mail thất bại. Lấy lý do cụ thể:

  ```
  docker compose exec web sh -c 'cd /var/www/html && php82 -r "
  require \"smtp.php\";
  try { smtp_send_mail([
    \"host\"=>getenv(\"SMTP_HOST\"), \"port\"=>getenv(\"SMTP_PORT\"),
    \"user\"=>getenv(\"SMTP_USER\"), \"pass\"=>getenv(\"SMTP_PASS\"),
    \"from\"=>getenv(\"SMTP_FROM\"), \"helo\"=>\"vietgeneducation.edu.vn\", \"timeout\"=>90,
  ], \"tuyensinh.vstep@vietgeneducation.edu.vn\", \"Test\", \"test\");
  echo \"OK\n\"; } catch (Throwable \$e) { echo \"LOI: \".\$e->getMessage().\"\n\"; }"'
  ```

- `535 authentication failed` → sai `SMTP_HOST` (xem mục 2) hoặc sai mật khẩu.
- Treo khoảng 30 giây rồi mới xong là bình thường: máy chủ mail cố tình trì hoãn lời chào
  để chống spam. Timeout trong code để 90s, đừng giảm.
- Nếu VPS chặn cổng ra 465, cần mở firewall egress tới `103.57.220.204:465`.
- PHP-FPM lọc sạch biến môi trường, nên `docker-entrypoint.sh` ghi lại chúng vào
  `/etc/php82/php-fpm.d/zz-smtp.conf` lúc khởi động. Nếu `getenv()` trả rỗng thì kiểm tra
  file này.

Ràng buộc: không commit `.env` hay mật khẩu vào git, không in mật khẩu ra màn hình hay log
khi chẩn đoán.
