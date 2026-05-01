const Server = require("../models/Server");

/* ---------------- GET ---------------- */

async function getServer(key) {
  return await Server.findOne({ key });
}

/* ---------------- ADD ---------------- */

async function addServer(key, name, uuid) {
  if (!/^[a-z0-9_-]+$/.test(key)) {
    throw new Error("Invalid key format");
  }

  const exists = await Server.findOne({ key });
  if (exists) {
    throw new Error("Server key already exists");
  }

  await Server.create({
    key,
    name,
    id: uuid
  });
}

/* ---------------- REMOVE ---------------- */

async function removeServer(key) {
  const res = await Server.findOneAndDelete({ key });
  return !!res;
}

/* ---------------- LIST ---------------- */

async function getAllServers() {
  return await Server.find({});
}

module.exports = {
  getServer,
  addServer,
  removeServer,
  getAllServers
};