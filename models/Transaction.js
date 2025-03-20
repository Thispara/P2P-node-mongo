const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coinType: { type: String, enum: ['BTC', 'ETH', 'XRP', 'DOGE'], required: true },
  amount: { type: Number, required: true },
  price: { type: Number },
  type: { type: String, enum: ['buy', 'sell', 'transfer'], required: true },
  externalAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);