(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = qs("[data-menu-button]");
        var nav = qs("[data-mobile-nav]");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
        });
    }

    function setupHeroCarousel() {
        var hero = qs("[data-hero-carousel]");

        if (!hero) {
            return;
        }

        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
                dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        show(0);
    }

    function setupFilters() {
        qsa("[data-filter-scope]").forEach(function (scope) {
            var search = qs("[data-filter-search]", scope);
            var year = qs("[data-filter-year]", scope);
            var type = qs("[data-filter-type]", scope);
            var region = qs("[data-filter-region]", scope);
            var cards = qsa("[data-movie-card]", scope);
            var empty = qs("[data-empty-state]", scope);

            function apply() {
                var query = normalize(search && search.value);
                var selectedYear = normalize(year && year.value);
                var selectedType = normalize(type && type.value);
                var selectedRegion = normalize(region && region.value);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type")
                    ].join(" "));

                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
                    var matchesType = !selectedType || normalize(card.getAttribute("data-type")) === selectedType;
                    var matchesRegion = !selectedRegion || normalize(card.getAttribute("data-region")) === selectedRegion;
                    var showCard = matchesQuery && matchesYear && matchesType && matchesRegion;

                    card.classList.toggle("is-hidden", !showCard);

                    if (showCard) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            [search, year, type, region].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function setupPosterFallbacks() {
        qsa("img[data-poster-image]").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("is-missing");
            });

            if (img.complete && img.naturalWidth === 0) {
                img.classList.add("is-missing");
            }
        });
    }

    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPosterFallbacks();
})();
