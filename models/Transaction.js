const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  bookName: { type: String, required: true },
  type: { type: String, enum: ['Add', 'Sold'], required: true },
  quantity: { type: Number, required: true },

  // Date is stored as string in format "yyyy-MM-dd HH:mm"
  date: {
    type: String,
    default: () => {
      return new Date().toLocaleString('en-GB', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(',', '').replace(/\//g, '-'); // e.g. "03-07-2025 14:35"
    },
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  bookName: { type: String, required: true },  // Add this
  type: { type: String, enum: ['Add', 'Sold'], required: true },
  quantity: { type: Number, required: true },  // Rename from quantityChanged
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
