(function () {
    "use strict";

    var CONFIG_URL = "data/test-config.json";

    var config = null;
    var sections = [];   // dữ liệu từng phần sau khi nạp
    var flatQuestions = []; // toàn bộ câu hỏi đã làm phẳng để chấm điểm
    var answers = {};    // id câu hỏi -> lựa chọn/đáp án người dùng nhập
    var scoreData = null;
    var timerId = null;
    var remainingSeconds = 0;

    function $(id) {
        return document.getElementById(id);
    }

    function show(id) {
        var el = $(id);
        if (el) el.hidden = false;
    }

    function hide(id) {
        var el = $(id);
        if (el) el.hidden = true;
    }

    // Chặn XSS: nội dung đề nằm trong JSON nên luôn chèn qua textContent,
    // riêng chỗ cần dựng HTML thì escape trước.
    function esc(text) {
        var div = document.createElement("div");
        div.textContent = text == null ? "" : String(text);
        return div.innerHTML;
    }

    function loadJSON(url) {
        return fetch(url, { cache: "no-store" }).then(function (res) {
            if (!res.ok) throw new Error("Không tải được " + url);
            return res.json();
        });
    }

    /**
     * Làm phẳng các phần thành một danh sách câu hỏi để chấm điểm,
     * đồng thời giữ lại thông tin phần để thống kê theo từng kỹ năng.
     */
    function buildFlatQuestions() {
        flatQuestions = [];
        sections.forEach(function (section) {
            if (section.type === "reading") {
                (section.passages || []).forEach(function (passage) {
                    (passage.questions || []).forEach(function (q) {
                        flatQuestions.push({
                            id: q.id,
                            sectionId: section.id,
                            sectionTitle: section.title,
                            type: "multiple_choice",
                            question: q.question,
                            options: q.options,
                            answer: q.answer,
                            explanation: q.explanation,
                            passageTitle: passage.title
                        });
                    });
                });
            } else {
                (section.questions || []).forEach(function (q) {
                    flatQuestions.push({
                        id: q.id,
                        sectionId: section.id,
                        sectionTitle: section.title,
                        type: section.type,
                        question: q.question,
                        options: q.options,
                        answer: q.answer,
                        hint: q.hint,
                        explanation: q.explanation
                    });
                });
            }
        });
    }

    function renderQuiz() {
        var body = $("vgQuizBody");
        if (!body) return;
        body.innerHTML = "";

        var counter = 0;

        sections.forEach(function (section) {
            var wrap = document.createElement("div");
            wrap.className = "vg-test-section";

            var head = document.createElement("div");
            head.className = "vg-test-section-head";
            head.innerHTML =
                "<h3>" + esc(section.title) + "</h3>" +
                "<p>" + esc(section.description || "") + "</p>";
            wrap.appendChild(head);

            if (section.type === "reading") {
                (section.passages || []).forEach(function (passage) {
                    var pBox = document.createElement("div");
                    pBox.className = "vg-test-passage";
                    pBox.innerHTML =
                        "<h4>" + esc(passage.title) + "</h4>" +
                        "<p>" + esc(passage.text) + "</p>";
                    wrap.appendChild(pBox);

                    (passage.questions || []).forEach(function (q) {
                        counter++;
                        wrap.appendChild(buildChoiceCard(q, counter));
                    });
                });
            } else if (section.type === "fill_blank") {
                (section.questions || []).forEach(function (q) {
                    counter++;
                    wrap.appendChild(buildBlankCard(q, counter));
                });
            } else {
                (section.questions || []).forEach(function (q) {
                    counter++;
                    wrap.appendChild(buildChoiceCard(q, counter));
                });
            }

            body.appendChild(wrap);
        });

        updateProgress();
    }

    function buildChoiceCard(q, index) {
        var card = document.createElement("div");
        card.className = "vg-question-card";
        card.setAttribute("data-qid", q.id);

        var html =
            '<div class="vg-question-title"><span class="vg-question-num">' + index +
            '</span>' + esc(q.question) + "</div>" +
            '<div class="vg-question-options">';

        (q.options || []).forEach(function (opt, i) {
            var inputId = "opt-" + q.id + "-" + i;
            html +=
                '<label class="vg-option" for="' + inputId + '">' +
                '<input type="radio" id="' + inputId + '" name="q-' + esc(q.id) + '" value="' + i + '">' +
                '<span class="vg-option-marker">' + String.fromCharCode(65 + i) + "</span>" +
                '<span class="vg-option-text">' + esc(opt) + "</span>" +
                "</label>";
        });

        html += "</div>";
        card.innerHTML = html;

        card.querySelectorAll("input[type=radio]").forEach(function (input) {
            input.addEventListener("change", function () {
                answers[q.id] = parseInt(input.value, 10);
                card.classList.add("vg-answered");
                updateProgress();
            });
        });

        return card;
    }

    function buildBlankCard(q, index) {
        var card = document.createElement("div");
        card.className = "vg-question-card";
        card.setAttribute("data-qid", q.id);

        card.innerHTML =
            '<div class="vg-question-title"><span class="vg-question-num">' + index +
            '</span>' + esc(q.question) + "</div>" +
            '<div class="vg-blank-wrap">' +
            '<input type="text" class="vg-blank-input" autocomplete="off" placeholder="Nhập từ còn thiếu">' +
            (q.hint ? '<span class="vg-blank-hint">Gợi ý: ' + esc(q.hint) + "</span>" : "") +
            "</div>";

        var input = card.querySelector(".vg-blank-input");
        input.addEventListener("input", function () {
            var val = input.value.trim();
            if (val) {
                answers[q.id] = val;
                card.classList.add("vg-answered");
            } else {
                delete answers[q.id];
                card.classList.remove("vg-answered");
            }
            updateProgress();
        });

        return card;
    }

    function updateProgress() {
        var done = Object.keys(answers).length;
        var total = flatQuestions.length;
        var pct = total ? Math.round((done / total) * 100) : 0;

        var text = $("vgProgressText");
        if (text) text.textContent = "Đã làm " + done + "/" + total + " câu";

        var fill = $("vgProgressFill");
        if (fill) fill.style.width = pct + "%";
    }

    function startTimer(minutes) {
        remainingSeconds = minutes * 60;
        renderTimer();
        timerId = window.setInterval(function () {
            remainingSeconds--;
            renderTimer();
            if (remainingSeconds <= 0) {
                window.clearInterval(timerId);
                timerId = null;
                // Hết giờ thì tự nộp bài với những câu đã làm.
                goToGate();
            }
        }, 1000);
    }

    function renderTimer() {
        var el = $("vgTimer");
        if (!el) return;
        var m = Math.floor(remainingSeconds / 60);
        var s = remainingSeconds % 60;
        el.innerHTML =
            '<i class="fa fa-clock-o"></i> ' + m + ":" + (s < 10 ? "0" : "") + s;
        el.classList.toggle("vg-timer-low", remainingSeconds <= 120);
    }

    /** So khớp đáp án điền khuyết: bỏ qua hoa thường và khoảng trắng thừa. */
    function isBlankCorrect(q, userValue) {
        if (!userValue) return false;
        var normalized = String(userValue).trim().toLowerCase();
        var accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
        return accepted.some(function (a) {
            return String(a).trim().toLowerCase() === normalized;
        });
    }

    function calculateScore() {
        var correct = 0;
        var bySection = {};

        flatQuestions.forEach(function (q) {
            if (!bySection[q.sectionId]) {
                bySection[q.sectionId] = {
                    title: q.sectionTitle,
                    correct: 0,
                    total: 0
                };
            }
            bySection[q.sectionId].total++;

            var userAnswer = answers[q.id];
            var ok;
            if (q.type === "fill_blank") {
                ok = isBlankCorrect(q, userAnswer);
            } else {
                ok = userAnswer === q.answer;
            }

            if (ok) {
                correct++;
                bySection[q.sectionId].correct++;
            }
            q._userAnswer = userAnswer;
            q._correct = ok;
        });

        var total = flatQuestions.length;
        var percent = total ? Math.round((correct / total) * 100) : 0;

        // Chọn bậc trình độ cao nhất mà điểm phần trăm đạt được.
        var level = config.levels[0];
        config.levels.forEach(function (lv) {
            if (percent >= lv.min_percent) level = lv;
        });

        return {
            correct: correct,
            total: total,
            percent: percent,
            level: level,
            bySection: bySection
        };
    }

    function goToGate() {
        if (timerId) {
            window.clearInterval(timerId);
            timerId = null;
        }
        scoreData = calculateScore();
        hide("vgTestQuiz");
        show("vgTestGate");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function buildResultSummaryText() {
        var lines = [];
        lines.push("Điểm: " + scoreData.correct + "/" + scoreData.total + " câu đúng (" + scoreData.percent + "%)");
        lines.push("Trình độ ước lượng: " + scoreData.level.label);
        lines.push("");
        lines.push("Chi tiết theo phần:");
        Object.keys(scoreData.bySection).forEach(function (key) {
            var s = scoreData.bySection[key];
            lines.push("- " + s.title + ": " + s.correct + "/" + s.total);
        });
        lines.push("");
        lines.push("Nhận xét: " + scoreData.level.summary);
        lines.push("Lời khuyên: " + scoreData.level.advice);
        lines.push("Khóa học gợi ý: " + scoreData.level.course);
        return lines.join("\n");
    }

    function renderResult(mailNote) {
        var pct = $("vgScorePercent");
        if (pct) pct.textContent = scoreData.percent + "%";

        var raw = $("vgScoreRaw");
        if (raw) raw.textContent = scoreData.correct + "/" + scoreData.total + " câu đúng";

        var label = $("vgLevelLabel");
        if (label) label.textContent = scoreData.level.label;

        var summary = $("vgLevelSummary");
        if (summary) summary.textContent = scoreData.level.summary;

        var advice = $("vgLevelAdvice");
        if (advice) advice.textContent = scoreData.level.advice;

        var course = $("vgLevelCourse");
        if (course) course.textContent = scoreData.level.course;

        var note = $("vgMailNote");
        if (note) note.textContent = mailNote || "";

        // Điểm theo từng phần
        var secBox = $("vgSectionScores");
        if (secBox) {
            secBox.innerHTML = "";
            Object.keys(scoreData.bySection).forEach(function (key) {
                var s = scoreData.bySection[key];
                var p = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                var col = document.createElement("div");
                col.className = "col-lg-4 col-md-6 md-mb-20";
                col.innerHTML =
                    '<div class="vg-section-score">' +
                    "<h5>" + esc(s.title) + "</h5>" +
                    '<div class="vg-section-bar"><span style="width:' + p + '%"></span></div>' +
                    "<strong>" + s.correct + "/" + s.total + "</strong> câu đúng" +
                    "</div>";
                secBox.appendChild(col);
            });
        }

        renderReview();

        hide("vgTestGate");
        show("vgTestResult");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderReview() {
        var box = $("vgReviewBody");
        if (!box) return;
        box.innerHTML = "";

        var index = 0;
        flatQuestions.forEach(function (q) {
            index++;
            var item = document.createElement("div");
            item.className = "vg-review-item " + (q._correct ? "vg-review-ok" : "vg-review-bad");

            var yourAnswer, rightAnswer;
            if (q.type === "fill_blank") {
                yourAnswer = q._userAnswer ? esc(q._userAnswer) : "<em>Bỏ trống</em>";
                var accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
                rightAnswer = esc(accepted.join(" / "));
            } else {
                yourAnswer =
                    typeof q._userAnswer === "number" && q.options[q._userAnswer] !== undefined
                        ? esc(q.options[q._userAnswer])
                        : "<em>Chưa chọn</em>";
                rightAnswer = esc(q.options[q.answer]);
            }

            item.innerHTML =
                '<div class="vg-review-head">' +
                '<span class="vg-review-num">Câu ' + index + "</span>" +
                '<span class="vg-review-badge">' +
                (q._correct ? '<i class="fa fa-check"></i> Đúng' : '<i class="fa fa-times"></i> Sai') +
                "</span>" +
                "</div>" +
                '<div class="vg-review-q">' + esc(q.question) + "</div>" +
                '<div class="vg-review-line"><span>Bạn trả lời:</span> ' + yourAnswer + "</div>" +
                (q._correct ? "" : '<div class="vg-review-line vg-review-right"><span>Đáp án đúng:</span> ' + rightAnswer + "</div>") +
                (q.explanation ? '<div class="vg-review-explain"><i class="fa fa-lightbulb-o"></i> ' + esc(q.explanation) + "</div>" : "");

            box.appendChild(item);
        });
    }

    function handleGateSubmit(evt) {
        evt.preventDefault();

        var form = evt.target;
        var btn = form.querySelector(".vg-popup-submit");
        var msg = $("vgGateMessage");

        function setMsg(text, isError) {
            if (!msg) return;
            msg.textContent = text;
            msg.classList.toggle("vg-popup-message-error", !!isError);
            msg.classList.toggle("vg-popup-message-ok", !isError);
        }

        if (btn) btn.disabled = true;
        setMsg("Đang chấm bài và gửi kết quả...", false);

        var data = new FormData(form);
        data.append("test_result", buildResultSummaryText());
        data.append("test_score", scoreData.correct + "/" + scoreData.total);
        data.append("test_percent", scoreData.percent + "%");
        data.append("test_level", scoreData.level.label);
        data.append("source", "Bài test trình độ");

        var request = new XMLHttpRequest();
        request.open("POST", "test-result.php", true);
        request.timeout = 180000;

        request.onload = function () {
            if (btn) btn.disabled = false;
            if (request.status === 200) {
                renderResult("Kết quả chi tiết đã được gửi tới email của bạn.");
            } else {
                // Vẫn cho xem điểm dù gửi mail hỏng - học viên đã làm xong bài.
                renderResult("Không gửi được email kết quả, nhưng bạn vẫn xem được điểm bên dưới. VietGen sẽ liên hệ với bạn qua số điện thoại.");
            }
        };

        request.onerror = request.ontimeout = function () {
            if (btn) btn.disabled = false;
            renderResult("Không gửi được email kết quả, nhưng bạn vẫn xem được điểm bên dưới. VietGen sẽ liên hệ với bạn qua số điện thoại.");
        };

        request.send(data);
    }

    document.addEventListener("DOMContentLoaded", function () {
        var intro = $("vgTestIntro");
        if (!intro) return; // không phải trang test

        loadJSON(CONFIG_URL)
            .then(function (cfg) {
                config = cfg;
                return Promise.all(cfg.sections.map(loadJSON));
            })
            .then(function (loaded) {
                sections = loaded;
                buildFlatQuestions();

                var total = flatQuestions.length;
                var totalEl = $("vgTotalQuestions");
                if (totalEl) totalEl.textContent = total;
                var metaCount = $("vgMetaCount");
                if (metaCount) metaCount.textContent = total;
                var metaTime = $("vgMetaTime");
                if (metaTime) metaTime.textContent = config.duration_minutes;

                renderQuiz();
            })
            .catch(function (err) {
                intro.innerHTML =
                    '<div class="vg-test-error">Không tải được nội dung bài test. ' +
                    "Vui lòng tải lại trang hoặc gọi hotline 0866.538.942.</div>";
                if (window.console) console.error(err);
            });

        var startBtn = $("vgStartBtn");
        if (startBtn) {
            startBtn.addEventListener("click", function () {
                hide("vgTestIntro");
                show("vgTestQuiz");
                startTimer(config.duration_minutes);
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        var submitBtn = $("vgSubmitBtn");
        if (submitBtn) {
            submitBtn.addEventListener("click", function () {
                var done = Object.keys(answers).length;
                var total = flatQuestions.length;
                var warn = $("vgSubmitWarn");

                if (done < total) {
                    var missing = total - done;
                    if (!submitBtn.dataset.confirmed) {
                        if (warn) {
                            warn.textContent =
                                "Bạn còn " + missing + " câu chưa làm. Bấm lần nữa để nộp bài.";
                        }
                        submitBtn.dataset.confirmed = "1";
                        return;
                    }
                }
                goToGate();
            });
        }

        var gateForm = $("vgGateForm");
        if (gateForm) {
            gateForm.addEventListener("submit", handleGateSubmit);

            var tabs = gateForm.querySelectorAll(".vg-region-tab");
            var regionField = gateForm.querySelector("input[name='region']");
            tabs.forEach(function (tab) {
                tab.addEventListener("click", function () {
                    tabs.forEach(function (t) { t.classList.remove("active"); });
                    tab.classList.add("active");
                    if (regionField) regionField.value = tab.getAttribute("data-region");
                });
            });
        }
    });
})();
