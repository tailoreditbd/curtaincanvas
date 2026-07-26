(() => {
  'use strict';

  const header = document.getElementById('siteHeader');
  const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 36);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((element) => revealObserver.observe(element));
  }

  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (element) => {
    const target = Number(element.dataset.count);
    const duration = 1200;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);
      element.textContent = target >= 1000 ? `${value.toLocaleString()}+` : `${value}+`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((counter) => {
      const target = Number(counter.dataset.count);
      counter.textContent = `${target.toLocaleString()}+`;
    });
  }

  document.querySelectorAll('#mainNav a').forEach((link) => {
    link.addEventListener('click', () => {
      const openMenu = document.querySelector('#mainNav.show');
      if (openMenu && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(openMenu).hide();
    });
  });

  const hero = document.querySelector('.hero');
  const heroCarousel = document.getElementById('heroCarousel');
  const heroBackgrounds = hero?.querySelectorAll('.hero-background') || [];
  const setHeroBackground = (slide) => {
    const slides = heroCarousel ? [...heroCarousel.querySelectorAll('.carousel-item')] : [];
    const slideIndex = slides.indexOf(slide);
    heroBackgrounds.forEach((background, index) => {
      background.classList.toggle('active', index === slideIndex);
    });
  };
  setHeroBackground(heroCarousel?.querySelector('.carousel-item.active'));
  heroCarousel?.addEventListener('slide.bs.carousel', (event) => {
    setHeroBackground(event.relatedTarget);
  });

  document.querySelectorAll('[data-collection-carousel]').forEach((carousel) => {
    const viewport = carousel.querySelector('.collection-carousel-viewport');
    const cards = carousel.querySelectorAll('.collection-slide');
    const previous = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const controls = carousel.querySelector('.collection-carousel-controls');

    if (!viewport || cards.length <= 3) {
      controls?.setAttribute('hidden', '');
      return;
    }

    const updateControls = () => {
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      previous.disabled = viewport.scrollLeft <= 2;
      next.disabled = viewport.scrollLeft >= maxScroll - 2;
    };
    const move = (direction) => {
      viewport.scrollBy({ left: viewport.clientWidth * direction, behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    viewport.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);
    updateControls();
  });
  document.getElementById('year').textContent = new Date().getFullYear();
})();
