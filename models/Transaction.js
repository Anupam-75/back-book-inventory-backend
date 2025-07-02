const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  bookName: { type: String, required: true },  // Add this
  type: { type: String, enum: ['Add', 'Sold'], required: true },
  quantity: { type: Number, required: true },  // Rename from quantityChanged
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
