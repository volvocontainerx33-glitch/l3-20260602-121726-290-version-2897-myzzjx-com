(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var note = document.querySelector('[data-result-note]');
  var movies = window.SEARCH_MOVIES || [];

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function posterStyle(movie) {
    return "background-image: linear-gradient(135deg, rgba(244, 63, 94, 0.78), rgba(15, 23, 42, 0.9)), url('" + movie.cover + "');";
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-cover" href="' + escapeHtml(movie.url) + '">',
      '    <div class="poster" style="' + posterStyle(movie) + '"><span>' + escapeHtml(movie.title) + '</span></div>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
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

  function search(query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      return movies.slice(0, 36);
    }
    return movies.filter(function (movie) {
      return [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.oneLine,
        movie.tags.join(' ')
      ].join(' ').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 96);
  }

  function render(query) {
    var list = search(query);
    if (note) {
      note.textContent = query ? '找到 ' + list.length + ' 条相关影片' : '展示精选影片，可输入片名、类型、年份或标签继续搜索';
    }
    if (results) {
      results.innerHTML = list.map(card).join('');
    }
  }

  if (input) {
    input.value = getQuery();
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input ? input.value : '');
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  render(input ? input.value : '');
})();
