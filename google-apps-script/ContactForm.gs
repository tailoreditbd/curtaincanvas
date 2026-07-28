const SPREADSHEET_ID = '1kDyKjXqJsBaC0qbGrAqHScTP0NMNLqfx8igVdFIjLYo';
const SHEET_NAME = 'web-booking-data';
const HEADERS = ['Timestamp', 'Full Name', 'Phone Number', 'Email (Optional)', 'Message', 'Source Page'];

function doGet() {
  return HtmlService.createHtmlOutput('Curtain Canvas consultation form receiver is active.');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = e && e.parameter ? e.parameter : {};
    if (String(data.website || '').trim()) return responsePage('Thank you.');

    const fullName = clean(data.fullName, 120);
    const phone = clean(data.phone, 30);
    const email = clean(data.email, 160);
    const message = clean(data.message, 2000);
    const source = clean(data.source, 220) || 'Website contact form';

    if (!fullName || !phone || !message) {
      return responsePage('Required fields are missing.');
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];
    if (!sheet) throw new Error('No worksheet tab is available.');

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1e1913').setFontColor('#f2d6a2');
      sheet.setFrozenRows(1);
    }

    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 3).setNumberFormat('@');
    sheet.getRange(nextRow, 1, 1, HEADERS.length)
      .setValues([[new Date(), fullName, phone, email, message, source]]);
    return responsePage('Your consultation request was received.');
  } catch (error) {
    console.error(error);
    return responsePage('We could not save the request. Please contact Curtain Canvas directly.');
  } finally {
    lock.releaseLock();
  }
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