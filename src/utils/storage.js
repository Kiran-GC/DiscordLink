const fs = require('fs');
const { SAVE_FILE } = require('../config/config');

function savePanel(id) {
    fs.writeFileSync(SAVE_FILE, JSON.stringify({ id }));
}

function loadPanel() {
    if (!fs.existsSync(SAVE_FILE)) return null;

    try {
        return JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8')).id || null;
    } catch {
        return null;
    }
}

function clearPanel() {
    if (fs.existsSync(SAVE_FILE)) {
        fs.unlinkSync(SAVE_FILE);
    }
}

module.exports = { savePanel, loadPanel, clearPanel };