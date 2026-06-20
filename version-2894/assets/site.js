(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  showSlide(0);

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(root) {
    var input = root.querySelector('.filter-input');
    var year = root.querySelector('.filter-year');
    var type = root.querySelector('.filter-type');
    var items = Array.prototype.slice.call(document.querySelectorAll('.filter-item'));
    var query = normalize(input && input.value);
    var yearValue = year ? year.value : '';
    var typeValue = type ? type.value : '';

    items.forEach(function (item) {
      var haystack = normalize([
        item.dataset.title,
        item.dataset.genre,
        item.dataset.region,
        item.dataset.type,
        item.dataset.year
      ].join(' '));
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedYear = !yearValue || item.dataset.year === yearValue;
      var matchedType = !typeValue || item.dataset.type === typeValue;
      item.classList.toggle('is-hidden', !(matchedQuery && matchedYear && matchedType));
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.tool-panel')).forEach(function (panel) {
    var input = panel.querySelector('.filter-input');
    var year = panel.querySelector('.filter-year');
    var type = panel.querySelector('.filter-type');
    var clear = panel.querySelector('.clear-filter');

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', function () {
          applyFilter(panel);
        });
        control.addEventListener('change', function () {
          applyFilter(panel);
        });
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (type) {
          type.value = '';
        }
        applyFilter(panel);
      });
    }
  });

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q');
  var searchInput = document.querySelector('.filter-input');
  var toolPanel = document.querySelector('.tool-panel');

  if (initialQuery && searchInput && toolPanel) {
    searchInput.value = initialQuery;
    applyFilter(toolPanel);
  }

  function startVideo(card) {
    var video = card.querySelector('video');
    var layer = card.querySelector('.play-layer');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-video');

    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video.hlsReady) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsReady = true;
      }
    } else if (!video.src) {
      video.src = source;
    }

    if (layer) {
      layer.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(function (card) {
    var layer = card.querySelector('.play-layer');
    var video = card.querySelector('video');

    if (layer) {
      layer.addEventListener('click', function () {
        startVideo(card);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!video.hlsReady && !video.src) {
          startVideo(card);
        }
      });
      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('is-hidden');
        }
      });
    }
  });
})();
