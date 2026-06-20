(function () {
    var mobileButton = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var url = './search.html';
            if (value) {
                url += '?q=' + encodeURIComponent(value);
            }
            window.location.href = url;
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function setSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        setInterval(function () {
            setSlide(index + 1);
        }, 5200);
    }

    document.querySelectorAll('[data-filter-box]').forEach(function (box) {
        var input = box.querySelector('[data-local-filter]');
        var list = document.querySelector('[data-card-list]');
        var buttons = Array.prototype.slice.call(box.querySelectorAll('[data-region-choice]'));
        var region = 'all';

        function applyFilter() {
            if (!list) {
                return;
            }
            var query = input ? input.value.trim().toLowerCase() : '';
            list.querySelectorAll('.movie-card').forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var cardRegion = card.getAttribute('data-region') || '';
                var year = card.getAttribute('data-year') || '';
                var genre = (card.getAttribute('data-genre') || '').toLowerCase();
                var tags = (card.getAttribute('data-tags') || '').toLowerCase();
                var textMatch = !query || title.indexOf(query) > -1 || year.indexOf(query) > -1 || genre.indexOf(query) > -1 || tags.indexOf(query) > -1;
                var regionMatch = region === 'all' || cardRegion === region;
                card.classList.toggle('is-filtered-out', !(textMatch && regionMatch));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                region = button.getAttribute('data-region-choice') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });
    });

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var panel = searchPage.querySelector('[data-search-panel]');
        var input = searchPage.querySelector('[data-search-input]');
        var regionSelect = searchPage.querySelector('[data-search-region]');
        var yearSelect = searchPage.querySelector('[data-search-year]');
        var results = searchPage.querySelector('[data-search-results]');
        var countNode = searchPage.querySelector('[data-search-count]');
        var titleNode = searchPage.querySelector('[data-search-title]');
        var movies = window.SEARCH_MOVIES;

        function fillOptions() {
            var regions = [];
            var years = [];
            movies.forEach(function (movie) {
                if (movie.region && regions.indexOf(movie.region) === -1) {
                    regions.push(movie.region);
                }
                if (movie.year && years.indexOf(movie.year) === -1) {
                    years.push(movie.year);
                }
            });
            regions.sort().forEach(function (region) {
                var option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            });
            years.sort().reverse().forEach(function (year) {
                var option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
        }

        function card(movie) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + movie.url + '">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
                '<span class="play-float">▶</span>',
                '</a>',
                '<div class="card-body">',
                '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
                '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
                '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
                '<p class="card-tags">' + escapeHtml(movie.genre) + '</p>',
                '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function runSearch() {
            var query = input.value.trim().toLowerCase();
            var region = regionSelect.value;
            var year = yearSelect.value;
            var found = movies.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
                var queryMatch = !query || haystack.indexOf(query) > -1;
                var regionMatch = region === 'all' || movie.region === region;
                var yearMatch = year === 'all' || movie.year === year;
                return queryMatch && regionMatch && yearMatch;
            }).slice(0, 160);
            results.innerHTML = found.map(card).join('');
            countNode.textContent = found.length ? '已匹配到 ' + found.length + ' 条内容' : '暂无匹配内容';
            titleNode.textContent = query ? '“' + input.value.trim() + '”的搜索结果' : '推荐搜索结果';
        }

        fillOptions();
        input.value = params.get('q') || '';
        runSearch();

        [input, regionSelect, yearSelect].forEach(function (node) {
            node.addEventListener('input', runSearch);
            node.addEventListener('change', runSearch);
        });

        panel.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });
    }
})();
