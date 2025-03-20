const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const OrderController = require('../controllers/OrderController');
const TransactionController = require('../controllers/TransactionController');

router.post('/register', UserController.register);
router.post('/deposit', UserController.deposit);
router.post('/deposit-crypto', UserController.depositCrypto);
router.post('/order', OrderController.createOrder);
router.post('/buy', OrderController.buyFromOrder);
router.post('/transfer', TransactionController.transferExternal);
router.get('/users/:username', UserController.getUserByUsername);
router.get('/transactions/user/:username', TransactionController.getUserTransactions);
router.get('/transactions/:transactionId', TransactionController.getTransactionById);
router.get('/orders/active', TransactionController.getActiveOrders); 

module.exports = router;