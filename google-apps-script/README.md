# Curtain Canvas contact form — one-time Google setup

1. Open the target spreadsheet and choose **Extensions → Apps Script**.
2. Replace the editor contents with `ContactForm.gs`, then save. The receiver targets `web-booking-data` and safely falls back to the spreadsheet's first tab if it is renamed.
3. Choose **Deploy → New deployment → Web app**.
4. Set **Execute as: Me** and **Who has access: Anyone**, then deploy and authorize once as the Sheet owner. Website visitors will never be asked to sign in or authorize Google.
5. Copy the deployed URL ending in `/exec` into `assets/js/contact-config.js`.
6. Submit one test entry from `/contact-us/` and confirm it appears in `Sheet1`.

The receiver creates the header row automatically when the sheet is empty and stores timestamp, full name, phone, optional email, message and source page.