(function () {
    "use strict";

    var SHOW_DELAY_MS = 2500;

    document.addEventListener("DOMContentLoaded", function () {
        var overlay = document.getElementById("vgLeadPopup");
        if (!overlay) return;

        function openPopup() {
            overlay.classList.add("vg-popup-active");
        }

        function closePopup() {
            overlay.classList.remove("vg-popup-active");
        }

        // Trang nào có data-vg-no-autopopup (ví dụ trang làm bài test) thì không
        // tự bật popup, tránh che mất nội dung người dùng đang làm dở.
        var autoOpen = !document.body.hasAttribute("data-vg-no-autopopup");
        var timer = autoOpen ? window.setTimeout(openPopup, SHOW_DELAY_MS) : null;

        var closeBtn = overlay.querySelector(".vg-popup-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", closePopup);
        }

        overlay.addEventListener("click", function (evt) {
            if (evt.target === overlay) closePopup();
        });

        document.addEventListener("keydown", function (evt) {
            if (evt.key === "Escape" && overlay.classList.contains("vg-popup-active")) {
                closePopup();
            }
        });

        var form = overlay.querySelector(".vg-popup-form");
        var regionField = form ? form.querySelector("input[name='region']") : null;
        var emailField = form ? form.querySelector("input[name='email']") : null;
        var messageBox = overlay.querySelector(".vg-popup-message");

        // Any CTA marked with data-vg-popup opens the registration modal.
        document.querySelectorAll("[data-vg-popup]").forEach(function (trigger) {
            trigger.addEventListener("click", function (evt) {
                evt.preventDefault();
                window.clearTimeout(timer);
                openPopup();
            });
        });

        // Newsletter form: carry the typed email into the modal instead of navigating.
        document.querySelectorAll("[data-vg-popup-form]").forEach(function (nlForm) {
            nlForm.addEventListener("submit", function (evt) {
                evt.preventDefault();
                window.clearTimeout(timer);
                var typed = nlForm.querySelector("input[name='email']");
                if (typed && emailField && typed.value) {
                    emailField.value = typed.value;
                }
                openPopup();
            });
        });

        var regionTabs = overlay.querySelectorAll(".vg-region-tab");
        regionTabs.forEach(function (tab) {
            tab.addEventListener("click", function () {
                regionTabs.forEach(function (t) { t.classList.remove("active"); });
                tab.classList.add("active");
                if (regionField) regionField.value = tab.textContent.trim();
            });
        });

        function setMessage(text, isError) {
            if (!messageBox) return;
            messageBox.textContent = text;
            messageBox.classList.toggle("vg-popup-message-error", !!isError);
            messageBox.classList.toggle("vg-popup-message-ok", !isError);
        }

        if (form) {
            form.addEventListener("submit", function (evt) {
                evt.preventDefault();

                var submitBtn = form.querySelector(".vg-popup-submit");
                if (submitBtn) submitBtn.disabled = true;
                setMessage("Đang gửi thông tin...", false);

                var request = new XMLHttpRequest();
                request.open("POST", form.getAttribute("action"), true);
                request.onload = function () {
                    if (submitBtn) submitBtn.disabled = false;
                    if (request.status === 200) {
                        setMessage(request.responseText, false);
                        form.reset();
                        if (regionField) {
                            var active = overlay.querySelector(".vg-region-tab.active");
                            regionField.value = active ? active.textContent.trim() : "Hà Nội";
                        }
                        window.setTimeout(closePopup, 2500);
                    } else {
                        setMessage(request.responseText || "Gửi thông tin thất bại, vui lòng thử lại.", true);
                    }
                };
                request.onerror = function () {
                    if (submitBtn) submitBtn.disabled = false;
                    setMessage("Không kết nối được máy chủ. Vui lòng gọi hotline 0866.538.942.", true);
                };
                request.send(new FormData(form));
            });
        }

        window.addEventListener("beforeunload", function () {
            window.clearTimeout(timer);
        });
    });
})();
