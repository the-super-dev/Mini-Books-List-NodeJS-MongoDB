const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  image: String // store uploaded filename
});

module.exports = mongoose.model('Book', bookSchema);
