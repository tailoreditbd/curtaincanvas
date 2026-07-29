(() => {
  'use strict';

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const phoneInput = document.getElementById('phone-number');
  const phoneSubmit = document.getElementById('phone-submit');
  const locationInput = document.getElementById('location-address');
  const legacyMessage = document.getElementById('legacy-message');
  const fileInput = document.getElementById('space-photos');
  const photoPayload = document.getElementById('photo-payload');
  const selectedFiles = document.getElementById('selected-files');
  const responseFrame = document.querySelector('iframe[name="contact-submit-frame"]');
  if (!form || !status) return;

  const endpoint = (window.CURTAIN_CANVAS_FORM_ENDPOINT || form.dataset.endpoint || '').trim();
  const maxPhotos = 3;
  const maxPhotoBytes = 4 * 1024 * 1024;
  const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif']);
  let awaitingResponse = false;
  let responseTimeout = null;

  if (endpoint) form.action = endpoint;

  const setStatus = (message, type = '') => {
    status.className = `form-status${type ? ` is-${type}` : ''}`;
    status.textContent = message;
  };

  const renderSelectedFiles = () => {
    if (!selectedFiles || !fileInput) return;
    selectedFiles.replaceChildren();
    [...fileInput.files].forEach((file) => {
      const item = document.createElement('span');
      item.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
      selectedFiles.appendChild(item);
    });
  };

  const validatePhotos = (files) => {
    if (files.length > maxPhotos) return `Please upload no more than ${maxPhotos} images.`;
    for (const file of files) {
      if (!allowedPhotoTypes.has(file.type.toLowerCase())) {
        return 'Please upload JPG, PNG, WebP, HEIC or AVIF photos only.';
      }
      if (file.size > maxPhotoBytes) return `${file.name} is larger than 4 MB.`;
    }
    return '';
  };

  const readPhoto = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const separator = result.indexOf(',');
      if (separator < 0) return reject(new Error(`Could not read ${file.name}.`));
      resolve({ name: file.name, type: file.type, data: result.slice(separator + 1) });
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });

  const restoreForm = (button) => {
    form.reset();
    form.classList.remove('was-validated');
    if (photoPayload) photoPayload.value = '[]';
    selectedFiles?.replaceChildren();
    button.disabled = false;
    button.innerHTML = button.dataset.originalText;
  };

  const finishSubmission = (button) => {
    if (!awaitingResponse) return;
    awaitingResponse = false;
    window.clearTimeout(responseTimeout);
    restoreForm(button);
    setStatus('Thank you. Your request has been sent; our team will contact you soon.', 'success');
  };

  fileInput?.addEventListener('change', () => {
    const error = validatePhotos([...fileInput.files]);
    renderSelectedFiles();
    if (error) setStatus(error, 'error');
    else setStatus('');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      setStatus('Please complete the required fields correctly.', 'error');
      form.querySelector(':invalid')?.focus();
      return;
    }

    if (!endpoint) {
      status.className = 'form-status is-error';
      status.innerHTML = 'Online consultation booking is temporarily unavailable. Please call <a href="tel:+8801728440393">+880 1728-440393</a> or use WhatsApp.';
      return;
    }

    const files = fileInput ? [...fileInput.files] : [];
    const photoError = validatePhotos(files);
    if (photoError) {
      setStatus(photoError, 'error');
      fileInput?.focus();
      return;
    }

    const button = form.querySelector('.form-submit');
    button.disabled = true;
    button.dataset.originalText ||= button.innerHTML;

    try {
      if (phoneInput && phoneSubmit) phoneSubmit.value = `'${phoneInput.value.replace(/^'/, '')}`;
      if (legacyMessage) legacyMessage.value = locationInput?.value || 'Location not provided';

      if (files.length) setStatus('Preparing your photos...');
      const photos = await Promise.all(files.map(readPhoto));
      if (photoPayload) photoPayload.value = JSON.stringify(photos);

      setStatus('Sending your consultation request...');
      awaitingResponse = true;
      HTMLFormElement.prototype.submit.call(form);
      responseTimeout = window.setTimeout(() => {
        if (!awaitingResponse) return;
        awaitingResponse = false;
        button.disabled = false;
        button.innerHTML = button.dataset.originalText;
        setStatus('We could not confirm the submission. Please try again or contact us by phone.', 'error');
      }, 30000);
    } catch (error) {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText;
      setStatus(error.message || 'The selected photos could not be prepared. Please try again.', 'error');
    }
  });

  responseFrame?.addEventListener('load', () => {
    const button = form.querySelector('.form-submit');
    if (button) finishSubmission(button);
  });
})();