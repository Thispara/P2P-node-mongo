const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coinType: { type: String, enum: ['BTC', 'ETH', 'XRP', 'DOGE'], required: true },
  amount: { type: Number, required: true },
  pricePerUnit: { type: Number , required: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);