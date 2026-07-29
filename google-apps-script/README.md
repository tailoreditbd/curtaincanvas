# Curtain Canvas contact form — Google Apps Script deployment

1. Open the target spreadsheet and choose **Extensions → Apps Script**.
2. Replace the editor contents with the complete updated `ContactForm.gs`, then save.
3. Choose **Deploy → Manage deployments**, edit the current Web App deployment, select **New version**, and deploy.
4. Keep **Execute as: Me** and **Who has access: Anyone**.
5. Authorize the requested Google Sheets and Google Drive permissions once as the Sheet owner. Website visitors will never be asked to sign in or authorize Google.
6. Keep the existing `/exec` Web App URL in `assets/js/contact-config.js`.
7. Submit one test entry from `/contact-us/` and confirm the row and Drive photo links.

## Data layout

The receiver preserves the existing A–F data order and adds the new information in G–H:

- A: Timestamp
- B: Full Name
- C: Phone Number
- D: Email (Optional)
- E: Location / Address (Optional)
- F: Source Page
- G: Type of Space
- H: Photo Links

## Private uploads

When photos are supplied, Apps Script creates or reuses:

`My Drive / CurtainCanvas.com / client-booking-images / <customer phone number> /`

Up to 3 JPG, PNG, WebP, HEIC, HEIF or AVIF images are accepted, with a maximum size of 4 MB each. Files retain the Drive owner's default private access. The Sheet stores clickable Drive links.