const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  bookName: { type: String, required: true },
  type: { type: String, enum: ['Add', 'Sold', 'Transfer'], required: true }, // ✅ Added Transfer
  quantity: { type: Number, required: true },

  // Store date as formatted string
  date: {
    type: String,
    default: () => {
      const now = new Date();
      const tzOffset = now.getTime() + (5.5 * 60 * 60 * 1000); // IST offset
      const istDate = new Date(tzOffset);
      const yyyy = istDate.getFullYear();
      const MM = String(istDate.getMonth() + 1).padStart(2, '0');
      const dd = String(istDate.getDate()).padStart(2, '0');
      const HH = String(istDate.getHours()).padStart(2, '0');
      const mm = String(istDate.getMinutes()).padStart(2, '0');
      return `${yyyy}-${MM}-${dd} ${HH}:${mm}`; // e.g. "2025-07-03 14:35"
    },
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
