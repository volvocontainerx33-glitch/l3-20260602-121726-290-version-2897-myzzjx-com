(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var heroCards = Array.prototype.slice.call(document.querySelectorAll('[data-hero-card]'));
  if (heroCards.length > 1) {
    var activeIndex = 0;
    setInterval(function () {
      heroCards[activeIndex].classList.remove('is-active');
      activeIndex = (activeIndex + 1) % heroCards.length;
      heroCards[activeIndex].classList.add('is-active');
    }, 4200);
  }

  var homeSearch = document.querySelector('[data-home-search]');
  if (homeSearch) {
    homeSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = homeSearch.querySelector('input');
      var value = input ? input.value.trim() : '';
      var target = homeSearch.getAttribute('action') || 'search.html';
      window.location.href = target + (value ? '?q=' + encodeURIComponent(value) : '');
    });
  }
})();
