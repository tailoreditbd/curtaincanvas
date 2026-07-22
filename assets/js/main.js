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

  document.getElementById('year').textContent = new Date().getFullYear();
})();
