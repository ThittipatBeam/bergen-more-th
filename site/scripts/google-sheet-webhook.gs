/**
 * Google Sheets receiver for the benchmark "Request a run" form.
 *
 * Setup
 * 1. Create a Google Sheet. The script creates a "Requests" tab on first use.
 * 2. Extensions > Apps Script. Paste this file, save.
 * 3. Deploy > New deployment > Web app.
 *      Execute as:      Me
 *      Who has access:  Anyone
 *    Authorize, then copy the /exec URL.
 * 4. Put it in site/.env:
 *      REQUEST_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 *    Optional shared secret: set SHARED_TOKEN below, then append
 *      ?token=YOUR_TOKEN
 *    to that URL.
 * 5. Restart the site. New requests append one row per submission.
 *
 * The site sends JSON: generatorName, generatorLink, embeddingName,
 * embeddingLink, rerankerName, rerankerLink, contact, email, notes.
 */

const SHEET_NAME = "Requests";
const SHARED_TOKEN = ""; // optional; must match ?token= in the URL

function doPost(e) {
  const params = e.parameter || {};
  if (SHARED_TOKEN && params.token !== SHARED_TOKEN) {
    return text("forbidden");
  }

  let data;
  try {
    data = JSON.parse((e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return text("invalid json");
  }

  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet =
    book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Received",
      "Generator",
      "Generator link",
      "Embedding",
      "Embedding link",
      "Reranker",
      "Reranker link",
      "Contact",
      "Email",
      "Notes",
    ]);
  }

  sheet.appendRow([
    new Date(),
    data.generatorName || "",
    data.generatorLink || "",
    data.embeddingName || "",
    data.embeddingLink || "",
    data.rerankerName || "(dense only)",
    data.rerankerLink || "",
    data.contact || "",
    data.email || "",
    data.notes || "",
  ]);

  return text(JSON.stringify({ ok: true }));
}

function text(body) {
  return ContentService.createTextOutput(body).setMimeType(
    ContentService.MimeType.TEXT
  );
}
