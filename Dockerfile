# Landing page tĩnh (HTML/CSS/JS) + mailer.php (form liên hệ qua PHP mail()).
# Gộp Nginx + PHP-FPM trong 1 container vì đây chỉ là site tĩnh, không cần tách service
# như các dự án backend khác trên VPS này.
FROM nginx:1.27-alpine
RUN apk add --no-cache php82-fpm php82-openssl php82-mbstring supervisor \
    && ln -sf /usr/bin/php82 /usr/bin/php

COPY . /var/www/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisord.conf

WORKDIR /var/www/html

EXPOSE 80
ENTRYPOINT ["supervisord", "-c", "/etc/supervisord.conf"]
