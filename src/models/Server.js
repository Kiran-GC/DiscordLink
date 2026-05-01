const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Server", serverSchema);