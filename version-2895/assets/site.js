(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!isOpen));
            nav.hidden = isOpen;
        });
    }

    function setupBackToTop() {
        document.querySelectorAll(".back-to-top").forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activate(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
        }
        start();
    }

    function normalize(text) {
        return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function setupFiltering() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        var count = document.querySelector("[data-visible-count]");
        if (!cards.length || (!inputs.length && !chips.length)) {
            return;
        }

        inputs.forEach(function (input) {
            if (input.hasAttribute("data-query-param")) {
                var params = new URLSearchParams(window.location.search);
                var value = params.get(input.getAttribute("data-query-param"));
                if (value) {
                    input.value = value;
                }
            }
        });

        function activeChipValue() {
            var activeChip = chips.find(function (chip) {
                return chip.classList.contains("active");
            });
            return activeChip ? activeChip.getAttribute("data-filter-chip") : "全部";
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.textContent
            ].join(" "));
        }

        function applyFilter() {
            var query = normalize(inputs.map(function (input) {
                return input.value;
            }).join(" "));
            var chip = activeChipValue();
            var chipQuery = chip && chip !== "全部" ? normalize(chip) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchChip = !chipQuery || text.indexOf(chipQuery) !== -1;
                var show = matchQuery && matchChip;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", applyFilter);
        });

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (other) {
                    other.classList.remove("active");
                });
                chip.classList.add("active");
                applyFilter();
            });
        });

        applyFilter();
    }

    function setupPlayers() {
        document.querySelectorAll("[data-hls-player]").forEach(function (wrapper) {
            var video = wrapper.querySelector("video[data-src]");
            var overlay = wrapper.querySelector(".player-overlay");
            var message = wrapper.querySelector("[data-player-message]");
            var hls = null;

            if (!video || !overlay) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || "";
                }
            }

            function attachSource() {
                var source = video.getAttribute("data-src");
                if (!source) {
                    setMessage("当前影片缺少播放源。");
                    return Promise.reject(new Error("missing hls source"));
                }

                if (video.getAttribute("src")) {
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return new Promise(function (resolve, reject) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                reject(new Error(data.type || "hls fatal error"));
                            }
                        });
                    });
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return Promise.resolve();
                }

                setMessage("当前浏览器需要加载 HLS 播放能力后才能播放。");
                return Promise.reject(new Error("hls not supported"));
            }

            function play() {
                setMessage("正在载入播放源...");
                attachSource()
                    .then(function () {
                        wrapper.classList.add("is-playing");
                        setMessage("");
                        return video.play();
                    })
                    .catch(function () {
                        wrapper.classList.remove("is-playing");
                        setMessage("播放源载入失败，请刷新页面或更换浏览器重试。");
                    });
            }

            overlay.addEventListener("click", play);
            video.addEventListener("play", function () {
                wrapper.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    wrapper.classList.remove("is-playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileNav();
        setupBackToTop();
        setupHero();
        setupFiltering();
        setupPlayers();
    });
})();
