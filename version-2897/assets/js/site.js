(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".nav-menu");
        var search = document.querySelector(".nav-search");

        if (!toggle || !menu || !search) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("open");
            search.classList.toggle("open", isOpen);
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupHeroSlider() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        if (slides.length <= 1) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        window.setInterval(function () {
            show(current + 1);
        }, 6200);
    }

    function setupFiltering() {
        var grid = document.querySelector("[data-filter-grid]");
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var input = document.querySelector("[data-filter-input]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var empty = document.querySelector("[data-filter-empty]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function textOf(card) {
            return [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.textContent || ""
            ].join(" ").toLowerCase();
        }

        function matchesSelect(card, select) {
            var key = select.getAttribute("data-filter-select");
            var value = select.value;
            if (!value) {
                return true;
            }
            return (card.getAttribute("data-" + key) || "").indexOf(value) !== -1;
        }

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;

            cards.forEach(function (card) {
                var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
                var matchesAllSelects = selects.every(function (select) {
                    return matchesSelect(card, select);
                });
                var shouldShow = matchesQuery && matchesAllSelects;
                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", applyFilter);
        });
        applyFilter();
    }

    function initializeMoviePlayer(videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function playVideo() {
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        function attachNative() {
            video.src = streamUrl;
            video.setAttribute("data-ready", "true");
            playVideo();
        }

        function attachWithHls() {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.setAttribute("data-ready", "true");
                playVideo();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    hls.destroy();
                    attachNative();
                }
            });
            video.hlsInstance = hls;
        }

        function start() {
            overlay.classList.add("is-hidden");

            if (video.getAttribute("data-ready") === "true") {
                playVideo();
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                attachNative();
                return;
            }

            if (window.Hls && Hls.isSupported()) {
                attachWithHls();
                return;
            }

            attachNative();
        }

        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    }

    window.initializeMoviePlayer = initializeMoviePlayer;

    ready(function () {
        setupMobileNavigation();
        setupHeroSlider();
        setupFiltering();
    });
}());
