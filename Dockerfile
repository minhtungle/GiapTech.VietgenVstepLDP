# Landing page tĩnh (HTML/CSS/JS) + mailer.php (form liên hệ qua PHP mail()).
# Gộp Nginx + PHP-FPM trong 1 container vì đây chỉ là site tĩnh, không cần tách service
# như các dự án backend khác trên VPS này.
FROM nginx:1.27-alpine
RUN apk add --no-cache php82 php82-fpm php82-openssl php82-mbstring supervisor msmtp ca-certificates \
    && ln -sf /usr/bin/msmtp /usr/sbin/sendmail

COPY . /var/www/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisord.conf

# msmtp thay busybox sendmail để mail() gửi được qua SMTP thật.
# Thông tin đăng nhập đến từ biến môi trường lúc chạy, không nằm trong image.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && printf 'sendmail_path = /usr/bin/msmtp -t --read-envelope-from\n' \
       > /etc/php82/conf.d/99-msmtp.ini

WORKDIR /var/www/html

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
