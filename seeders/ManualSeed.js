require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const readline = require('readline');
const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const { connectDB } = require('../config/database');

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const isValidNumber = (num) => !isNaN(num) && Number(num) >= 0;

async function manualSeed() {
  await connectDB();
  console.log('Starting Manual Seed...');

  console.log('\n=== Seed User ===');
  const createUser = await question('Do you want to create a new user? (yes/no): ');
  let user;
  if (createUser.toLowerCase() === 'yes') {
    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');

    let errors = [];
    if (!username) errors.push('username cannot be empty');
    if (!isValidEmail(email)) errors.push('email is invalid');
    if (!password) errors.push('password cannot be empty');

    if (errors.length > 0) {
      console.log('Input errors:');
      errors.forEach((err) => console.log(`- ${err}`));
      rl.close();
      mongoose.connection.close();
      return;
    }

    const userResponse = await axios.post(`${BASE_URL}/register`, {
      username,
      email,
      password,
    });
    user = userResponse.data.user;
    console.log(`User created successfully: ${user._id}`);
  } else {
    const username = await question('Enter username of existing user to proceed: ');
    try {
      const response = await axios.get(`${BASE_URL}/users/${username}`);
      user = response.data.user;
      console.log(`Proceeding with user: ${user.username} (${user._id})`);
    } catch (error) {
      console.log('Error finding user:', error.response?.data?.message || error.message);
      rl.close();
      mongoose.connection.close();
      return;
    }
  }

  
  const addFiatDeposit = await question('Do you want to deposit fiat currency (THB/USD)? (yes/no): ');
  if (addFiatDeposit.toLowerCase() === 'yes') {
    const currency = await question('Enter currency (THB/USD): ');
    const amount = await question('Enter amount: ');

    let errors = [];
    if (!['THB', 'USD'].includes(currency)) errors.push('currency must be THB or USD');
    if (!isValidNumber(amount) || Number(amount) <= 0) errors.push('amount must be a positive number');

    if (errors.length > 0) {
      console.log('Input errors:');
      errors.forEach((err) => console.log(`- ${err}`));
    } else {
      await axios.post(`${BASE_URL}/deposit`, {
        userId: user._id,
        amount: Number(amount),
        currency,
      });
      console.log(`Deposited ${amount} ${currency} to user (converted to USDT)`);
    }
  }

  
  const addCryptoDeposit = await question('Do you want to deposit cryptocurrency? (yes/no): ');
  if (addCryptoDeposit.toLowerCase() === 'yes') {
    const coinType = await question('Enter coinType (USDT, BTC, ETH, XRP, DOGE): ');
    const amount = await question('Enter amount: ');

    let errors = [];
    if (!['USDT', 'BTC', 'ETH', 'XRP', 'DOGE'].includes(coinType)) errors.push('coinType must be USDT, BTC, ETH, XRP, or DOGE');
    if (!isValidNumber(amount) || Number(amount) <= 0) errors.push('amount must be a positive number');

    if (errors.length > 0) {
      console.log('Input errors:');
      errors.forEach((err) => console.log(`- ${err}`));
    } else {
      await axios.post(`${BASE_URL}/deposit-crypto`, {
        userId: user._id,
        coinType,
        amount: Number(amount),
      });
      console.log(`Deposited ${amount} ${coinType} to user`);
    }
  }

  
  console.log('\n=== Seed Order ===');
  const createOrder = await question('Do you want to create an order? (yes/no): ');
  if (createOrder.toLowerCase() === 'yes') {
    const orderUserId = user._id; 
    const coinType = await question('Enter coinType (e.g., BTC, ETH, XRP, DOGE): ');
    const amount = await question('Enter amount: ');
    const pricePerUnit = await question('Enter pricePerUnit (in USDT): ');

    let errors = [];
    if (!isValidObjectId(orderUserId)) errors.push('userId is invalid');
    if (!['BTC', 'ETH', 'XRP', 'DOGE'].includes(coinType)) errors.push('coinType must be BTC, ETH, XRP, or DOGE');
    if (!isValidNumber(amount) || Number(amount) <= 0) errors.push('amount must be a positive number');
    if (!isValidNumber(pricePerUnit) || Number(pricePerUnit) <= 0) errors.push('pricePerUnit must be a positive number');

    if (errors.length > 0) {
      console.log('Input errors:');
      errors.forEach((err) => console.log(`- ${err}`));
    } else {
      const orderResponse = await axios.post(`${BASE_URL}/order`, {
        userId: orderUserId,
        coinType,
        amount: Number(amount),
        pricePerUnit: Number(pricePerUnit),
      });
      const order = orderResponse.data.order;
      console.log(`Order created successfully: ${order._id}`);
    }
  }

  
  console.log('\n=== Seed Transaction ===');
  const createTransaction = await question('Do you want to create a transaction? (yes/no): ');
  if (createTransaction.toLowerCase() === 'yes') {
    const txType = await question('Enter type (buy/transfer): ');
    if (txType === 'buy') {
      
      console.log('Fetching active orders...');
      let activeOrders;
      try {
        const response = await axios.get(`${BASE_URL}/orders/active`);
        activeOrders = response.data;
      } catch (error) {
        console.log('Error fetching active orders:', error.response?.data?.message || error.message);
        activeOrders = [];
      }

      if (activeOrders.length === 0) {
        console.log('No active orders available to buy.');
      } else {
        console.log('Available active orders:');
        activeOrders.forEach((order, index) => {
          console.log(
            `${index + 1}. Order ID: ${order._id}, Seller: ${order.seller}, Coin: ${order.coinType}, Amount: ${order.amount}, Price per Unit: ${order.pricePerUnit} USDT`
          );
        });

        const orderIndex = await question('Enter the number of the order you want to buy from (1, 2, ...): ');
        const selectedOrder = activeOrders[Number(orderIndex) - 1];
        if (!selectedOrder) {
          console.log('Invalid order selection.');
        } else {
          const buyerId = user._id;
          const amount = await question('Enter amount to buy: ');

          let errors = [];
          if (!isValidNumber(amount) || Number(amount) <= 0) errors.push('amount must be a positive number');
          if (Number(amount) > selectedOrder.amount) errors.push('amount exceeds available order amount');

          if (errors.length > 0) {
            console.log('Input errors:');
            errors.forEach((err) => console.log(`- ${err}`));
          } else {
            try {
              await axios.post(`${BASE_URL}/buy`, {
                orderId: selectedOrder._id,
                buyerId,
                amount: Number(amount),
              });
              console.log('Buy transaction created successfully');
            } catch (error) {
              console.log('Error creating buy transaction:', error.response?.data?.message || error.message);
            }
          }
        }
      }
    } else if (txType === 'transfer') {
      const userId = user._id;
      const coinType = await question('Enter coinType (e.g., BTC, ETH, XRP, DOGE): ');
      const amount = await question('Enter amount: ');
      const externalAddress = await question('Enter externalAddress: ');

      let errors = [];
      if (!isValidObjectId(userId)) errors.push('userId is invalid');
      if (!['BTC', 'ETH', 'XRP', 'DOGE'].includes(coinType)) errors.push('coinType must be BTC, ETH, XRP, or DOGE');
      if (!isValidNumber(amount) || Number(amount) <= 0) errors.push('amount must be a positive number');
      if (!externalAddress) errors.push('externalAddress cannot be empty');

      if (errors.length > 0) {
        console.log('Input errors:');
        errors.forEach((err) => console.log(`- ${err}`));
      } else {
        try {
          await axios.post(`${BASE_URL}/transfer`, {
            userId,
            coinType,
            amount: Number(amount),
            externalAddress,
          });
          console.log('Transfer transaction created successfully');
        } catch (error) {
          console.log('Error creating transfer transaction:', error.response?.data?.message || error.message);
        }
      }
    } else {
      console.log('Invalid transaction type. Must be "buy" or "transfer".');
    }
  }

  console.log('\nManual Seed completed!');
  rl.close();
  mongoose.connection.close();
}

manualSeed().catch((err) => {
  console.error('Error occurred:', err);
  rl.close();
  mongoose.connection.close();
});