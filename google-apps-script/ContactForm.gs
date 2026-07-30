const SPREADSHEET_ID = '1kDyKjXqJsBaC0qbGrAqHScTP0NMNLqfx8igVdFIjLYo';
const SHEET_NAME = 'web-booking-data';
const UPLOAD_SITE_FOLDER = 'CurtainCanvas.store';
const UPLOAD_ROOT_FOLDER = 'client-booking-images';
const HEADERS = [
  'Timestamp',
  'Full Name',
  'Phone Number',
  'Email (Optional)',
  'Location / Address (Optional)',
  'Source Page',
  'Type of Space',
  'Photo Links'
];
const ALLOWED_SPACE_TYPES = ['Home/Apartment', 'Office Space', 'Hotel/Resort'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

function doGet() {
  return HtmlService.createHtmlOutput('Curtain Canvas consultation form receiver is active.');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const data = e && e.parameter ? e.parameter : {};
    if (String(data.website || '').trim()) return responsePage('Thank you.');

    const fullName = clean(data.fullName, 120);
    const phone = clean(data.phone, 30);
    const email = clean(data.email, 160);
    const location = clean(data.location || data.message, 1000);
    const spaceType = clean(data.spaceType, 80);
    const source = clean(data.source, 220) || 'Website contact form';

    if (!fullName || !phone || ALLOWED_SPACE_TYPES.indexOf(spaceType) === -1) {
      return responsePage('Required fields are missing or invalid.');
    }

    const photos = parsePhotos(data.photos);
    const photoLinks = savePhotosToDrive(photos, phone);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];
    if (!sheet) throw new Error('No worksheet tab is available.');

    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#1e1913')
      .setFontColor('#f2d6a2');
    sheet.setFrozenRows(1);

    const nextRow = Math.max(sheet.getLastRow() + 1, 2);
    sheet.getRange(nextRow, 3).setNumberFormat('@');
    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([[
      new Date(),
      fullName,
      phone,
      email,
      location,
      source,
      spaceType,
      photoLinks.join('\n')
    ]]);
    sheet.getRange(nextRow, 5).setWrap(true);
    setLinkedPhotoCell(sheet.getRange(nextRow, 8), photoLinks);

    return responsePage('Your consultation request was received.');
  } catch (error) {
    console.error(error);
    return responsePage('We could not save the request. Please contact Curtain Canvas directly.');
  } finally {
    lock.releaseLock();
  }
}

function parsePhotos(value) {
  if (!value) return [];
  const photos = JSON.parse(String(value));
  if (!Array.isArray(photos)) throw new Error('Invalid photo payload.');
  if (photos.length > MAX_PHOTOS) throw new Error('Too many photos.');
  return photos;
}

function savePhotosToDrive(photos, phone) {
  if (!photos.length) return [];

  const safePhone = String(phone).replace(/^'/, '').replace(/[^0-9+]/g, '') || 'unknown-number';
  const siteFolder = getOrCreateFolder(DriveApp.getRootFolder(), UPLOAD_SITE_FOLDER);
  const rootFolder = getOrCreateFolder(siteFolder, UPLOAD_ROOT_FOLDER);
  const customerFolder = getOrCreateFolder(rootFolder, safePhone);

  return photos.map(function (photo, index) {
    const mimeType = String(photo.type || '').toLowerCase();
    if (ALLOWED_IMAGE_TYPES.indexOf(mimeType) === -1) throw new Error('Unsupported image type.');

    const encoded = String(photo.data || '');
    if (!encoded || encoded.length > Math.ceil(MAX_PHOTO_BYTES * 1.38) + 100) {
      throw new Error('Image is empty or too large.');
    }

    const bytes = Utilities.base64Decode(encoded);
    if (bytes.length > MAX_PHOTO_BYTES) throw new Error('Image is too large.');

    const fallbackName = 'space-photo-' + (index + 1) + extensionForMimeType(mimeType);
    const fileName = safeFileName(photo.name) || fallbackName;
    const blob = Utilities.newBlob(bytes, mimeType, fileName);
    const file = customerFolder.createFile(blob);
    return file.getUrl();
  });
}

function getOrCreateFolder(parentFolder, name) {
  const folders = parentFolder.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(name);
}

function setLinkedPhotoCell(range, links) {
  if (!links.length) {
    range.clearContent();
    return;
  }

  const text = links.join('\n');
  const builder = SpreadsheetApp.newRichTextValue().setText(text);
  let offset = 0;
  links.forEach(function (url) {
    builder.setLinkUrl(offset, offset + url.length, url);
    offset += url.length + 1;
  });
  range.setRichTextValue(builder.build()).setWrap(true);
}

function safeFileName(value) {
  return String(value || '')
    .replace(/[\\/:*?"<>|\r\n]/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 120);
}

function extensionForMimeType(mimeType) {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/heic': '.heic',
    'image/heif': '.heif',
    'image/avif': '.avif'
  };
  return extensions[mimeType] || '.jpg';
}

function clean(value, maxLength) {
  let text = String(value || '').trim().slice(0, maxLength);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function responsePage(message) {
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><p>' + escapeHtml(message) + '</p>');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];
  });
}