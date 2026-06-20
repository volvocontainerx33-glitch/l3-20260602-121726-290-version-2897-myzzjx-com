(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var button = document.querySelector(".mobile-nav-toggle");
        var panel = document.querySelector(".mobile-nav-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupSiteSearch() {
        document.querySelectorAll(".js-site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "./search.html";
                window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero-slider");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = slides.findIndex(function (slide) {
            return slide.classList.contains("is-active");
        });
        current = current >= 0 ? current : 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        var next = function () {
            show(current + 1);
        };
        var timer = window.setInterval(next, 5000);
        var prevButton = hero.querySelector("[data-hero-prev]");
        var nextButton = hero.querySelector("[data-hero-next]");

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                window.clearInterval(timer);
                show(current - 1);
                timer = window.setInterval(next, 5000);
            });
        }
        if (nextButton) {
            nextButton.addEventListener("click", function () {
                window.clearInterval(timer);
                show(current + 1);
                timer = window.setInterval(next, 5000);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                timer = window.setInterval(next, 5000);
            });
        });
    }

    function cardText(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-category") || ""
        ].join(" ").toLowerCase();
    }

    function setupFilters() {
        document.querySelectorAll(".js-filter-scope").forEach(function (scope) {
            var input = scope.querySelector(".js-card-search");
            var chips = Array.prototype.slice.call(scope.querySelectorAll(".js-filter-chip"));
            var select = scope.querySelector(".js-sort-select");
            var grid = document.querySelector(".js-card-grid");
            var empty = document.querySelector(".js-empty-result");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".js-movie-card"));
            var activeFilter = "";

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var text = cardText(card);
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
                    var visible = matchesQuery && matchesFilter;
                    card.hidden = !visible;
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            function sortCards(value) {
                var sorted = cards.slice();
                if (value === "year-desc") {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    });
                } else if (value === "year-asc") {
                    sorted.sort(function (a, b) {
                        return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
                    });
                } else if (value === "title") {
                    sorted.sort(function (a, b) {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
                    });
                } else {
                    sorted.sort(function (a, b) {
                        return cards.indexOf(a) - cards.indexOf(b);
                    });
                }
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var preset = params.get("q");
                if (preset) {
                    input.value = preset;
                }
                input.addEventListener("input", apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    activeFilter = chip.getAttribute("data-filter-value") || "";
                    apply();
                });
            });
            if (select) {
                select.addEventListener("change", function () {
                    sortCards(select.value);
                    apply();
                });
            }
            apply();
        });
    }

    ready(function () {
        setupMobileNav();
        setupSiteSearch();
        setupHero();
        setupFilters();
    });
})();
