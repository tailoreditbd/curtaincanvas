(() => {
  'use strict';

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const phoneInput = document.getElementById('phone-number');
  const phoneSubmit = document.getElementById('phone-submit');
  if (!form || !status) return;

  const endpoint = (window.CURTAIN_CANVAS_FORM_ENDPOINT || form.dataset.endpoint || '').trim();
  if (endpoint) form.action = endpoint;

  form.addEventListener('submit', (event) => {
    status.className = 'form-status';
    status.textContent = '';

    if (!form.checkValidity()) {
      event.preventDefault();
      form.classList.add('was-validated');
      status.classList.add('is-error');
      status.textContent = 'Please complete the required fields correctly.';
      form.querySelector(':invalid')?.focus();
      return;
    }

    if (!endpoint) {
      event.preventDefault();
      status.classList.add('is-error');
      status.innerHTML = 'Online consultation booking is temporarily unavailable. Please call <a href="tel:+8801728440393">+880 1728-440393</a> or use WhatsApp.';
      return;
    }

    if (phoneInput && phoneSubmit) {
      phoneSubmit.value = `'${phoneInput.value.replace(/^'/, '')}`;
    }

    const button = form.querySelector('.form-submit');
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.textContent = 'Sending…';
    status.textContent = 'Sending your consultation request…';

    window.setTimeout(() => {
      form.reset();
      form.classList.remove('was-validated');
      button.disabled = false;
      button.innerHTML = button.dataset.originalText;
      status.classList.add('is-success');
      status.textContent = 'Thank you. Your request has been sent; our team will contact you soon.';
    }, 1600);
  });
})();