#!/bin/sh
# Sinh /etc/msmtprc từ biến môi trường mỗi lần container khởi động.
# Mật khẩu chỉ tồn tại trong env + file 600 của container, không nằm trong image hay repo.
set -e

if [ -n "$SMTP_HOST" ] && [ -n "$SMTP_USER" ] && [ -n "$SMTP_PASS" ]; then
    SMTP_PORT="${SMTP_PORT:-587}"
    SMTP_FROM="${SMTP_FROM:-$SMTP_USER}"

    # Cổng 465 dùng SSL ngầm, các cổng khác dùng STARTTLS.
    if [ "$SMTP_PORT" = "465" ]; then
        TLS_MODE="tls_starttls off"
    else
        TLS_MODE="tls_starttls on"
    fi

    cat > /etc/msmtprc <<MSMTPRC
defaults
auth            on
tls             on
$TLS_MODE
tls_trust_file  /etc/ssl/certs/ca-certificates.crt
logfile         /var/log/msmtp.log

account         default
host            $SMTP_HOST
port            $SMTP_PORT
from            $SMTP_FROM
user            $SMTP_USER
password        $SMTP_PASS
MSMTPRC

    chmod 600 /etc/msmtprc
    chown root:root /etc/msmtprc
    touch /var/log/msmtp.log
    chmod 666 /var/log/msmtp.log
    # PHP-FPM mặc định lọc sạch biến môi trường, phải khai báo lại để mailer.php
    # đọc được bằng getenv().
    {
        echo "[www]"
        echo "env[SMTP_HOST] = \$SMTP_HOST"
        echo "env[SMTP_PORT] = \$SMTP_PORT"
        echo "env[SMTP_USER] = \$SMTP_USER"
        echo "env[SMTP_PASS] = \$SMTP_PASS"
        echo "env[SMTP_FROM] = \$SMTP_FROM"
    } > /etc/php82/php-fpm.d/zz-smtp.conf
    chmod 600 /etc/php82/php-fpm.d/zz-smtp.conf

    echo "[entrypoint] SMTP đã cấu hình: $SMTP_USER qua $SMTP_HOST:$SMTP_PORT"
else
    echo "[entrypoint] CẢNH BÁO: thiếu SMTP_HOST/SMTP_USER/SMTP_PASS - form sẽ không gửi được mail."
fi

exec "$@"
