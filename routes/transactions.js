const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

router.post('/', async (req, res) => {
  const trx = new Transaction(req.body);
  await trx.save();
  res.json(trx);
});

router.get('/', async (req, res) => {
  const trxList = await Transaction.find().populate('bookId').sort({ date: -1 });
  res.json(trxList);
});

module.exports = router;
