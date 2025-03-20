const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const wallets = [
      { currency_type: 'USDT', wallet_address: crypto.randomBytes(32).toString('hex'), balance: 0.0 },
      { currency_type: 'BTC', wallet_address: crypto.randomBytes(32).toString('hex'), balance: 0.0 },
      { currency_type: 'ETH', wallet_address: crypto.randomBytes(32).toString('hex'), balance: 0.0 },
      { currency_type: 'XRP', wallet_address: crypto.randomBytes(32).toString('hex'), balance: 0.0 },
      { currency_type: 'DOGE', wallet_address: crypto.randomBytes(32).toString('hex'), balance: 0.0 },
    ];

    const user = new User({
      username,
      email,
      password_hash: hashedPassword,
      wallets,
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.depositCrypto = async (req, res) => {
  const { userId, coinType, amount } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const validCoinTypes = ['BTC', 'ETH', 'XRP', 'DOGE'];
    if (!validCoinTypes.includes(coinType)) {
      return res.status(400).json({ message: 'Invalid coin type' });
    }

    const wallet = user.wallets.find(w => w.currency_type === coinType);
    if (!wallet) return res.status(404).json({ message: `${coinType} wallet not found` });

    wallet.balance = parseFloat(wallet.balance) + amount;
    await user.save();

    res.status(200).json({ message: 'Crypto deposit successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deposit = async (req, res) => {
  const { userId, amount, currency } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let usdtAmount = 0;
    if (currency === 'THB') {
      usdtAmount = amount / 34;
    } else if (currency === 'USD') {
      usdtAmount = amount;
    } else {
      return res.status(400).json({ message: 'Invalid currency' });
    }

    const usdtWallet = user.wallets.find(wallet => wallet.currency_type === 'USDT');
    if (!usdtWallet) return res.status(404).json({ message: 'USDT wallet not found' });

    usdtWallet.balance = parseFloat(usdtWallet.balance) + usdtAmount;
    await user.save();

    res.status(200).json({ message: 'Deposit successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};