const mongoose = require('mongoose');

const stock = new mongoose.Schema({
  stock : String,
  price : String,
  likes : {type: Number, default: 0}
});

module.exports = mongoose.model('stock',stock);