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

        var timer = window.setTimeout(openPopup, SHOW_DELAY_MS);

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

        var regionTabs = overlay.querySelectorAll(".vg-region-tab");
        regionTabs.forEach(function (tab) {
            tab.addEventListener("click", function () {
                regionTabs.forEach(function (t) { t.classList.remove("active"); });
                tab.classList.add("active");
            });
        });

        var form = overlay.querySelector(".vg-popup-form");
        if (form) {
            form.addEventListener("submit", function (evt) {
                evt.preventDefault();
                closePopup();
            });
        }

        window.addEventListener("beforeunload", function () {
            window.clearTimeout(timer);
        });
    });
})();
