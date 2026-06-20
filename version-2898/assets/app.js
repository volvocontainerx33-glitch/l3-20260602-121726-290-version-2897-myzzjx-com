(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;

    function showSlide(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    if (slides.length) {
      showSlide(0);
      if (prev) prev.addEventListener("click", function () { showSlide(current - 1); });
      if (next) next.addEventListener("click", function () { showSlide(current + 1); });
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () { showSlide(i); });
      });
      window.setInterval(function () { showSlide(current + 1); }, 5600);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");

    function filterCards() {
      if (!cards.length) return;
      var q = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var y = yearFilter ? yearFilter.value : "";
      var t = typeFilter ? typeFilter.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var genre = (card.getAttribute("data-genre") || "").toLowerCase();
        var year = card.getAttribute("data-year") || "";
        var type = card.getAttribute("data-type") || "";
        var ok = true;
        if (q && title.indexOf(q) === -1 && genre.indexOf(q) === -1) ok = false;
        if (y && year !== y) ok = false;
        if (t && type !== t) ok = false;
        card.style.display = ok ? "" : "none";
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle("is-visible", visible === 0);
    }

    if (filterInput) filterInput.addEventListener("input", filterCards);
    if (yearFilter) yearFilter.addEventListener("change", filterCards);
    if (typeFilter) typeFilter.addEventListener("change", filterCards);
  });
})();

function bindPlayer(u) {
  function setup() {
    var video = document.querySelector("[data-player-video]");
    var playButton = document.querySelector("[data-play-button]");
    var cover = document.querySelector("[data-play-cover]");
    var attached = false;
    var hls = null;

    function load() {
      if (!video || attached) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = u;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(u);
        hls.attachMedia(video);
      } else {
        video.src = u;
      }
      attached = true;
    }

    function start() {
      if (!video) return;
      load();
      if (cover) cover.classList.add("is-hidden");
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    if (playButton) playButton.addEventListener("click", start);
    if (cover) cover.addEventListener("click", start);
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) start();
      });
      video.addEventListener("play", function () {
        if (cover) cover.classList.add("is-hidden");
      });
    }
  }

  if (document.readyState !== "loading") {
    setup();
  } else {
    document.addEventListener("DOMContentLoaded", setup);
  }
}
