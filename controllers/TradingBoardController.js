const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.createTrade = async (req, res) => {
  const { userId, coinType, amount, pricePerUnit } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const wallet = user.wallets.find(w => w.currency_type === coinType);
    if (!wallet || parseFloat(wallet.balance) < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const order = new Order({ userId, coinType, amount, pricePerUnit });
    await order.save();

    wallet.balance = parseFloat(wallet.balance) - amount;
    await user.save();

    res.status(201).json({ message: 'Trade created successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buyFromTrade = async (req, res) => {
  const { orderId, buyerId, amount } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'active') {
      return res.status(404).json({ message: 'Order not found or closed' });
    }

    if (order.amount < amount) {
      return res.status(400).json({ message: 'Not enough coins in order' });
    }

    const buyer = await User.findById(buyerId);
    const seller = await User.findById(order.userId);
    if (!buyer || !seller) return res.status(404).json({ message: 'User not found' });

    const buyerUsdtWallet = buyer.wallets.find(w => w.currency_type === 'USDT');
    const buyerCoinWallet = buyer.wallets.find(w => w.currency_type === order.coinType);
    const sellerUsdtWallet = seller.wallets.find(w => w.currency_type === 'USDT');
    const sellerCoinWallet = seller.wallets.find(w => w.currency_type === order.coinType);

    const totalPrice = amount * order.pricePerUnit;
    if (parseFloat(buyerUsdtWallet.balance) < totalPrice) {
      return res.status(400).json({ message: 'Insufficient USDT balance' });
    }

    // อัพเดท balance
    buyerUsdtWallet.balance = parseFloat(buyerUsdtWallet.balance) - totalPrice;
    buyerCoinWallet.balance = parseFloat(buyerCoinWallet.balance) + amount;
    sellerUsdtWallet.balance = parseFloat(sellerUsdtWallet.balance) + totalPrice;

    await buyer.save();
    await seller.save();

    // อัพเดท Order
    order.amount -= amount;
    if (order.amount === 0) order.status = 'closed';
    await order.save();

    // บันทึก Transaction
    const transaction = new Transaction({
      senderId: order.userId,
      receiverId: buyerId,
      coinType: order.coinType,
      amount,
      price: totalPrice,
      type: 'buy',
    });
    await transaction.save();

    res.status(200).json({ message: 'Purchase successful', transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};