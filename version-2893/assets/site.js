(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) return;
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function fillSelect(select, values) {
    if (!select) return;
    values.filter(Boolean).sort().forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var scope = document.querySelector('[data-filter-scope]');
    var list = document.querySelector('[data-filter-list]');
    if (!scope || !list) return;
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var region = scope.querySelector('[data-filter-region]');
    var type = scope.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
    var years = Array.from(new Set(cards.map(function (card) { return card.getAttribute('data-year'); })));
    var regions = Array.from(new Set(cards.map(function (card) { return card.getAttribute('data-region'); })));
    var types = Array.from(new Set(cards.map(function (card) { return card.getAttribute('data-type'); })));

    fillSelect(year, years);
    fillSelect(region, regions);
    fillSelect(type, types);

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) input.value = q;

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) ok = false;
        if (selectedYear && card.getAttribute('data-year') !== selectedYear) ok = false;
        if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) ok = false;
        if (selectedType && card.getAttribute('data-type') !== selectedType) ok = false;
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [input, year, region, type].forEach(function (item) {
      if (!item) return;
      item.addEventListener('input', apply);
      item.addEventListener('change', apply);
    });
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video[data-stream]');
      if (!video) return;
      var stream = video.getAttribute('data-stream');
      var hlsInstance = null;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else {
        video.src = stream;
      }

      function togglePlay() {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {});
          }
        } else {
          video.pause();
        }
      }

      function toggleMute() {
        video.muted = !video.muted;
      }

      function toggleFullScreen() {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        }
      }

      player.querySelectorAll('[data-play-toggle]').forEach(function (button) {
        button.addEventListener('click', togglePlay);
      });
      player.querySelectorAll('[data-mute-toggle]').forEach(function (button) {
        button.addEventListener('click', toggleMute);
      });
      player.querySelectorAll('[data-fullscreen-toggle]').forEach(function (button) {
        button.addEventListener('click', toggleFullScreen);
      });
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
    });
  }

  function setupPlayerScroll() {
    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var player = document.querySelector('[data-player]');
        if (!player) return;
        event.preventDefault();
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupPlayerScroll();
  });
})();
