const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  currency_type: { type: String, required: true },
  wallet_address: { type: String, required: true, unique: true },
  balance: { type: mongoose.Types.Decimal128, default: 0.0 },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String, required: true },
  wallets: [WalletSchema],
  created_at: { type: Date, default: Date.now },
});

UserSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'userId',
});

UserSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'senderId',
});

module.exports = mongoose.model('User', UserSchema);