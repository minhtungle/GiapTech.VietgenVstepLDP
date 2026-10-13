<?php
    require_once __DIR__ . "/smtp.php";

    // Only process POST reqeusts.
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get the form fields and remove whitespace.
        $name = strip_tags(trim($_POST["name"] ?? ""));
		$name = str_replace(array("\r","\n"),array(" "," "),$name);
        $email = filter_var(trim($_POST["email"] ?? ""), FILTER_SANITIZE_EMAIL);
        $phone = strip_tags(trim($_POST["phone"] ?? ""));
        $message = trim($_POST["message"] ?? "");
        $course = strip_tags(trim($_POST["course"] ?? ""));
        $region = strip_tags(trim($_POST["region"] ?? ""));

        // Check that data was sent to the mailer.
        if ( empty($name) OR empty($phone) OR !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            // Set a 400 (bad request) response code and exit.
            http_response_code(400);
            echo "Vui lòng nhập đầy đủ họ tên, email và số điện thoại hợp lệ.";
            exit;
        }

        // Set the recipient email address.
        $recipient = "tuyensinh.vstep@vietgeneducation.edu.vn";

        // Set the email subject.
        $subject = "Đăng ký test đầu vào VSTEP - $name";

        // Build the email content.
        $email_content = "Họ và tên: $name\n";
        $email_content .= "Email: $email\n";
        $email_content .= "Số điện thoại: $phone\n";
        if (!empty($course)) {
            $email_content .= "Chứng chỉ cần: $course\n";
        }
        if (!empty($region)) {
            $email_content .= "Khu vực: $region\n";
        }
        if (!empty($message)) {
            $email_content .= "Nội dung:\n$message\n";
        }
        $email_content .= "\n--\nGửi tự động từ form đăng ký trên website VietGen.\n";

        // Gửi qua SMTP khi có cấu hình, nếu không thì quay về mail() của hệ thống.
        $smtp_host = getenv("SMTP_HOST");
        $smtp_user = getenv("SMTP_USER");
        $smtp_pass = getenv("SMTP_PASS");

        $sent = false;
        $error = "";

        if ($smtp_host && $smtp_user && $smtp_pass) {
            try {
                $sent = smtp_send_mail([
                    "host"     => $smtp_host,
                    "port"     => getenv("SMTP_PORT") ?: 465,
                    "user"     => $smtp_user,
                    "pass"     => $smtp_pass,
                    "from"     => getenv("SMTP_FROM") ?: $smtp_user,
                    "helo"     => "vietgeneducation.edu.vn",
                    "timeout"  => 90,
                    "reply_to" => "$name <$email>",
                ], $recipient, $subject, $email_content);
            } catch (Throwable $e) {
                $error = $e->getMessage();
                error_log("[mailer] SMTP that bai: " . $error);
            }
        } else {
            $email_headers = "From: VietGen Website <$recipient>\r\n";
            $email_headers .= "Reply-To: $name <$email>\r\n";
            $email_headers .= "Content-Type: text/plain; charset=UTF-8";
            $sent = mail($recipient, $subject, $email_content, $email_headers);
            if (!$sent) {
                $error = "mail() that bai - chua cau hinh SMTP";
                error_log("[mailer] " . $error);
            }
        }

        if ($sent) {
            // Set a 200 (okay) response code.
            http_response_code(200);
            echo "Cảm ơn bạn! VietGen sẽ liên hệ tư vấn trong thời gian sớm nhất.";
        } else {
            // Set a 500 (internal server error) response code.
            http_response_code(500);
            echo "Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline 0866.538.942.";
        }

    } else {
        // Not a POST request, set a 403 (forbidden) response code.
        http_response_code(403);
        echo "There was a problem with your submission, please try again.";
    }

?>
