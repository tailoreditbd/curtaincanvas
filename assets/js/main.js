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
      const isMobileCategory = link.classList.contains('collection-category-title') && window.innerWidth < 992;
      if (isMobileCategory) return;
      const openMenu = document.querySelector('#mainNav.show');
      if (openMenu && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(openMenu).hide();
    });
  });

  document.querySelectorAll('.collection-category-title').forEach((category) => {
    category.setAttribute('aria-expanded', 'false');
    category.addEventListener('click', (event) => {
      if (window.innerWidth >= 992) return;
      event.preventDefault();
      event.stopPropagation();

      const group = category.closest('.collection-menu-group');
      const menu = category.closest('.collection-menu-grid');
      if (!group || !menu) return;
      const willOpen = !group.classList.contains('submenu-open');

      menu.querySelectorAll('.collection-menu-group.submenu-open').forEach((openGroup) => {
        openGroup.classList.remove('submenu-open');
        openGroup.querySelector('.collection-category-title')?.setAttribute('aria-expanded', 'false');
      });
      group.classList.toggle('submenu-open', willOpen);
      category.setAttribute('aria-expanded', String(willOpen));
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
    const autoMoveDelay = 4800;
    let autoMoveTimer = null;
    let isPaused = false;

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
    const stopAutoMove = () => {
      if (autoMoveTimer) window.clearInterval(autoMoveTimer);
      autoMoveTimer = null;
    };
    const startAutoMove = () => {
      stopAutoMove();
      if (reduceMotion || isPaused || document.hidden) return;
      autoMoveTimer = window.setInterval(() => {
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        if (viewport.scrollLeft >= maxScroll - 2) {
          viewport.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          move(1);
        }
      }, autoMoveDelay);
    };
    const restartAutoMove = () => {
      stopAutoMove();
      startAutoMove();
    };

    previous.addEventListener('click', () => {
      move(-1);
      restartAutoMove();
    });
    next.addEventListener('click', () => {
      move(1);
      restartAutoMove();
    });
    carousel.addEventListener('pointerenter', () => {
      isPaused = true;
      stopAutoMove();
    });
    carousel.addEventListener('pointerleave', () => {
      isPaused = false;
      startAutoMove();
    });
    carousel.addEventListener('focusin', () => {
      isPaused = true;
      stopAutoMove();
    });
    carousel.addEventListener('focusout', (event) => {
      if (carousel.contains(event.relatedTarget)) return;
      isPaused = false;
      startAutoMove();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoMove();
      else startAutoMove();
    });
    viewport.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', () => {
      updateControls();
      restartAutoMove();
    });
    updateControls();
    startAutoMove();
  });
  document.querySelectorAll('.video-carousel').forEach((carousel) => {
    carousel.addEventListener('slide.bs.carousel', () => {
      carousel.querySelectorAll('iframe[src*="youtube.com/embed/"]').forEach((frame) => {
        frame.contentWindow?.postMessage(JSON.stringify({
          event: 'command',
          func: 'pauseVideo',
          args: ''
        }), 'https://www.youtube.com');
      });
    });
  });
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
