<?php
/**
 * SMTP client tối giản, không phụ thuộc thư viện ngoài.
 *
 * Viết riêng vì hai lý do:
 *  - mail()/msmtp không bắt tay được với máy chủ OneMail trên nền Alpine;
 *  - máy chủ này trì hoãn ~30s trước khi gửi xong lời chào (chống spam),
 *    nên cần timeout rộng và đọc hết các dòng "250-" nối tiếp.
 */

function smtp_read($fp)
{
    $data = "";
    while (($line = fgets($fp, 1024)) !== false) {
        $data .= $line;
        // Dòng cuối của một phản hồi SMTP có dạng "250 xxx" (dấu cách), các dòng
        // nối tiếp dùng "250-". Đọc tới khi gặp dấu cách mới dừng.
        if (strlen($line) >= 4 && $line[3] === " ") {
            break;
        }
    }
    return $data;
}

function smtp_cmd($fp, $cmd, $expect)
{
    if ($cmd !== null) {
        fwrite($fp, $cmd . "\r\n");
    }
    $response = smtp_read($fp);
    $code = (int) substr($response, 0, 3);
    if (!in_array($code, (array) $expect, true)) {
        throw new RuntimeException("SMTP: chờ " . implode("/", (array) $expect) . ", nhận: " . trim($response));
    }
    return $response;
}

/**
 * Gửi một email dạng text thuần qua SMTP có xác thực.
 * Ném RuntimeException kèm lý do cụ thể nếu thất bại.
 */
function smtp_send_mail($config, $to, $subject, $body)
{
    $host    = $config["host"];
    $port    = (int) $config["port"];
    $user    = $config["user"];
    $pass    = $config["pass"];
    $from    = $config["from"] !== "" ? $config["from"] : $user;
    $timeout = isset($config["timeout"]) ? (int) $config["timeout"] : 90;

    // Cổng 465 dùng SSL ngầm; các cổng khác bắt đầu bằng plaintext rồi STARTTLS.
    $transport = ($port === 465) ? "ssl://" : "tcp://";

    $context = stream_context_create([
        "ssl" => [
            "verify_peer"       => true,
            "verify_peer_name"  => true,
            "SNI_enabled"       => true,
            "peer_name"         => $host,
        ],
    ]);

    $fp = @stream_socket_client(
        $transport . $host . ":" . $port,
        $errno,
        $errstr,
        $timeout,
        STREAM_CLIENT_CONNECT,
        $context
    );

    if (!$fp) {
        throw new RuntimeException("Không kết nối được $host:$port ($errstr)");
    }

    stream_set_timeout($fp, $timeout);

    try {
        smtp_cmd($fp, null, 220);                      // lời chào của máy chủ
        smtp_cmd($fp, "EHLO " . $config["helo"], 250);

        if ($port !== 465) {
            smtp_cmd($fp, "STARTTLS", 220);
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException("Bật TLS thất bại");
            }
            smtp_cmd($fp, "EHLO " . $config["helo"], 250);
        }

        smtp_cmd($fp, "AUTH LOGIN", 334);
        smtp_cmd($fp, base64_encode($user), 334);
        smtp_cmd($fp, base64_encode($pass), 235);

        smtp_cmd($fp, "MAIL FROM:<" . $from . ">", 250);
        smtp_cmd($fp, "RCPT TO:<" . $to . ">", [250, 251]);
        smtp_cmd($fp, "DATA", 354);

        $headers = "From: VietGen Website <" . $from . ">\r\n"
                 . "To: <" . $to . ">\r\n"
                 . "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n"
                 . "MIME-Version: 1.0\r\n"
                 . "Content-Type: text/plain; charset=UTF-8\r\n"
                 . "Content-Transfer-Encoding: base64\r\n";

        if (!empty($config["reply_to"])) {
            $headers .= "Reply-To: " . $config["reply_to"] . "\r\n";
        }

        $payload = $headers . "\r\n" . chunk_split(base64_encode($body), 76, "\r\n");

        fwrite($fp, $payload . "\r\n.\r\n");
        smtp_cmd($fp, null, 250);

        @smtp_cmd($fp, "QUIT", [221, 250]);
    } finally {
        fclose($fp);
    }

    return true;
}
