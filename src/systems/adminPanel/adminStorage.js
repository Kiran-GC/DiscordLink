const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'adminPanel.json');

/* ---------------- LOAD ---------------- */

function loadPanel() {
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')).id || null;
  } catch {
    return null;
  }
}

/* ---------------- SAVE ---------------- */

function savePanel(id) {
  fs.writeFileSync(filePath, JSON.stringify({ id }, null, 2));
}

/* ---------------- CLEAR ---------------- */

function clearPanel() {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = { loadPanel, savePanel, clearPanel };