const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: String,
  content: String,
  owner: String
});

module.exports = mongoose.model("Document", documentSchema);
