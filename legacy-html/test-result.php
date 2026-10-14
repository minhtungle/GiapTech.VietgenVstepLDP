<?php
    /**
     * Nhận kết quả bài test trình độ, gửi 2 email:
     *  1. Kết quả chi tiết cho học viên;
     *  2. Thông tin lead kèm điểm cho hộp thư tuyển sinh.
     *
     * Trả 200 khi gửi được mail cho học viên. Mail nội bộ hỏng không làm
     * hỏng trải nghiệm người dùng nên chỉ ghi log.
     */
    require_once __DIR__ . "/smtp.php";

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        http_response_code(403);
        echo "There was a problem with your submission, please try again.";
        exit;
    }

    $name = strip_tags(trim($_POST["name"] ?? ""));
    $name = str_replace(array("\r", "\n"), array(" ", " "), $name);
    $email = filter_var(trim($_POST["email"] ?? ""), FILTER_SANITIZE_EMAIL);
    $phone = strip_tags(trim($_POST["phone"] ?? ""));
    $course = strip_tags(trim($_POST["course"] ?? ""));
    $region = strip_tags(trim($_POST["region"] ?? ""));

    $test_result  = trim($_POST["test_result"] ?? "");
    $test_score   = strip_tags(trim($_POST["test_score"] ?? ""));
    $test_percent = strip_tags(trim($_POST["test_percent"] ?? ""));
    $test_level   = strip_tags(trim($_POST["test_level"] ?? ""));

    if (empty($name) OR empty($phone) OR !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Vui lòng nhập đầy đủ họ tên, email và số điện thoại hợp lệ.";
        exit;
    }

    // Chỉ giữ lại các ký tự in được: nội dung này do trình duyệt gửi lên nên
    // không tin tưởng hoàn toàn, tránh để lọt header injection vào email.
    $test_result = preg_replace('/[^\P{C}\n]+/u', '', $test_result);

    $recipient = "tuyensinh.vstep@vietgeneducation.edu.vn";

    $smtp_host = getenv("SMTP_HOST");
    $smtp_user = getenv("SMTP_USER");
    $smtp_pass = getenv("SMTP_PASS");

    if (!$smtp_host || !$smtp_user || !$smtp_pass) {
        error_log("[test-result] Thieu cau hinh SMTP");
        http_response_code(500);
        echo "Hệ thống chưa gửi được email kết quả.";
        exit;
    }

    $smtp_config = [
        "host"    => $smtp_host,
        "port"    => getenv("SMTP_PORT") ?: 465,
        "user"    => $smtp_user,
        "pass"    => $smtp_pass,
        "from"    => getenv("SMTP_FROM") ?: $smtp_user,
        "helo"    => "vietgeneducation.edu.vn",
        "timeout" => 90,
    ];

    // ---- Mail 1: gửi kết quả cho học viên ----
    $student_subject = "Kết quả test trình độ tiếng Anh của bạn - VietGen";

    $student_body  = "Chào $name,\n\n";
    $student_body .= "Cảm ơn bạn đã hoàn thành bài test trình độ tiếng Anh của VietGen.\n";
    $student_body .= "Dưới đây là kết quả của bạn:\n\n";
    $student_body .= "========================================\n";
    $student_body .= $test_result . "\n";
    $student_body .= "========================================\n\n";
    $student_body .= "Lưu ý: bài test này đánh giá Ngữ pháp, Từ vựng và Đọc hiểu.\n";
    $student_body .= "Hai kỹ năng Speaking và Writing sẽ được giáo viên kiểm tra trực tiếp\n";
    $student_body .= "khi bạn tham gia buổi test đầu vào tại trung tâm.\n\n";
    $student_body .= "Tư vấn viên của VietGen sẽ liên hệ với bạn qua số $phone\n";
    $student_body .= "để trao đổi về lộ trình học phù hợp.\n\n";
    $student_body .= "Mọi thắc mắc xin liên hệ:\n";
    $student_body .= "Hotline: 0866.538.942\n";
    $student_body .= "Email: $recipient\n\n";
    $student_body .= "Trân trọng,\n";
    $student_body .= "VietGen Language Education\n";

    $student_sent = false;
    try {
        $student_sent = smtp_send_mail(
            $smtp_config + ["reply_to" => "VietGen <$recipient>"],
            $email,
            $student_subject,
            $student_body
        );
    } catch (Throwable $e) {
        error_log("[test-result] Gui mail hoc vien that bai: " . $e->getMessage());
    }

    // Nghỉ một nhịp trước phiên SMTP thứ hai: máy chủ hay từ chối khi nhận
    // nhiều kết nối dồn dập từ cùng một nguồn.
    sleep(2);

    // ---- Mail 2: gửi thông tin lead về hộp thư hệ thống ----
    $admin_subject = "Kết quả test trình độ - $name ($test_score)";

    $admin_body  = "Học viên vừa hoàn thành bài test trình độ trên website.\n\n";
    $admin_body .= "THÔNG TIN LIÊN HỆ\n";
    $admin_body .= "Họ và tên: $name\n";
    $admin_body .= "Email: $email\n";
    $admin_body .= "Số điện thoại: $phone\n";
    if (!empty($course)) {
        $admin_body .= "Chứng chỉ cần: $course\n";
    }
    if (!empty($region)) {
        $admin_body .= "Khu vực: $region\n";
    }
    $admin_body .= "\nKẾT QUẢ BÀI TEST\n";
    $admin_body .= "Điểm: $test_score ($test_percent)\n";
    $admin_body .= "Trình độ: $test_level\n\n";
    $admin_body .= $test_result . "\n\n";
    $admin_body .= "Email kết quả gửi cho học viên: " . ($student_sent ? "thành công" : "THẤT BẠI") . "\n";
    $admin_body .= "\n--\nGửi tự động từ trang test trình độ trên website VietGen.\n";

    try {
        smtp_send_mail(
            $smtp_config + ["reply_to" => "$name <$email>"],
            $recipient,
            $admin_subject,
            $admin_body
        );
    } catch (Throwable $e) {
        // Lead không tới được hộp thư nội bộ thì ghi log để còn lần theo,
        // nhưng vẫn trả kết quả cho học viên.
        error_log("[test-result] Gui mail noi bo that bai: " . $e->getMessage());
    }

    if ($student_sent) {
        http_response_code(200);
        echo "Đã gửi kết quả vào email của bạn.";
    } else {
        http_response_code(500);
        echo "Không gửi được email kết quả.";
    }
?>
