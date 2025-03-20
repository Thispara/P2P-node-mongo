require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

async function seed() {
  await connectDB();

  await User.deleteMany({});
  await Order.deleteMany({});
  await Transaction.deleteMany({});

  const user1Data = {
    username: 'user1',
    email: 'user1@example.com',
    password: 'password123',
  };

  const user2Data = {
    username: 'user2',
    email: 'user2@example.com',
    password: 'password123',
  };

  const user1Response = await axios.post(`${BASE_URL}/register`, user1Data);
  const user1 = user1Response.data.user;
  console.log(`User1 created: ${user1._id}`);

  const user2Response = await axios.post(`${BASE_URL}/register`, user2Data);
  const user2 = user2Response.data.user;
  console.log(`User2 created: ${user2._id}`);

  
  await axios.post(`${BASE_URL}/deposit`, {
    userId: user1._id,
    amount: 340000, 
    currency: 'THB',
  });
  console.log(`Deposited 340,000 THB to user1 (1,000 USDT)`);

  await axios.post(`${BASE_URL}/deposit`, {
    userId: user2._id,
    amount: 100000, 
    currency: 'USD',
  });
  console.log(`Deposited 100000 USD to user2 (500 USDT)`);

  
  await axios.post(`${BASE_URL}/deposit-crypto`, {
    userId: user1._id,
    coinType: 'BTC',
    amount: 1.0,
  });
  console.log('Deposited 1 BTC to user1');

  await axios.post(`${BASE_URL}/deposit-crypto`, {
    userId: user2._id,
    coinType: 'ETH',
    amount: 10.0,
  });
  console.log('Deposited 10 ETH to user2');

  
  const order1Data = {
    userId: user1._id,
    coinType: 'BTC',
    amount: 0.5,
    pricePerUnit: 98754.321,
  };

  const order2Data = {
    userId: user2._id,
    coinType: 'ETH',
    amount: 5,
    pricePerUnit: 1234.567,
  };

  const order1Response = await axios.post(`${BASE_URL}/order`, order1Data);
  const order1 = order1Response.data.order;
  console.log(`Order1 created: ${order1._id}`);

  const order2Response = await axios.post(`${BASE_URL}/order`, order2Data);
  const order2 = order2Response.data.order;
  console.log(`Order2 created: ${order2._id}`);

  
  await axios.post(`${BASE_URL}/buy`, {
    orderId: order1._id,
    buyerId: user2._id,
    amount: 0.2, 
  });
  console.log(`User2 bought 0.2 BTC from order1`);

  
  await axios.post(`${BASE_URL}/transfer`, {
    userId: user2._id,
    coinType: 'ETH',
    amount: 2,
    externalAddress: 'external_address_123',
  });
  console.log(`User2 transferred 2 ETH to external address`);

  console.log('Seeding completed');
  mongoose.connection.close();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  mongoose.connection.close();
});