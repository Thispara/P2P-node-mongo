const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Order = require('../models/Order');

exports.transferExternal = async (req, res) => {
  const { userId, coinType, amount, externalAddress } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const wallet = user.wallets.find(w => w.currency_type === coinType);
    if (!wallet || parseFloat(wallet.balance) < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance = parseFloat(wallet.balance) - amount;
    await user.save();

    const transaction = new Transaction({
      senderId: userId,
      coinType,
      amount,
      type: 'transfer',
      externalAddress,
    });
    await transaction.save();

    res.status(200).json({ message: 'Transfer successful', transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserTransactions = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const transactions = await Transaction.find({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  const { transactionId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ message: 'Invalid transactionId' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveOrders = async (req, res) => {
  try {
    const activeOrders = await Order.find({ status: 'active' })
      .populate('userId', 'username')
      .select('userId coinType pricePerUnit amount');

    const result = activeOrders.map(order => ({
      seller: order.userId.username,
      coinType: order.coinType,
      pricePerUnit: order.pricePerUnit,
      amount: order.amount,
    }));

    res.status(200).json({ activeOrders: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};