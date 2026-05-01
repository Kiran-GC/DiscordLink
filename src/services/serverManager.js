const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../config/servers.json");

function load() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function save(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getServer(key) {
  const data = load();
  return data[key];
}

function addServer(key, name, uuid) {
  const data = load();

  if (!/^[a-z0-9_-]+$/.test(key)) {
    throw new Error("Invalid key format");
  }

  if (data[key]) {
    throw new Error("Server key already exists");
  }

  data[key] = { id: uuid, name };
  save(data);
}

module.exports = { getServer, addServer };