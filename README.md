## Installation

### Clone the repository:
   ```bash
   git clone <https://github.com/Thispara/P2P-node-mongo>
   cd P2P-node-mongo
```
### Install dependencies:
``` bash
npm install
```
### Create a .env file in the root directory and add the following: text
MONGODB_URI=MONGO_URI = mongodb+srv://paradontake:1NPtyj7U3Ed8ROti@cluster0.kxr2l.mongodb.net/
PORT=3000

## Usage
#### Start the server:
``` bash
npm start
```
### Seed the database with initial data:

``` bash
npm run seed
``` 
### Or use manual to seeding data:
```bash
npm run manual-seed
```
**Note:** Ensure the server is running (npm start) in a separate terminal before running npm run seed or npm run manual-seed

## API Endpoints

* POST /api/register: Register a new user
* POST /api/deposit: Deposit fiat currency (THB/USD)
* POST /api/deposit-crypto: Deposit crypto currency
* POST /api/order: Create a new order to sell cryptocurrency
* POST /api/buy: Buy cryptocurrency from an existing order
* POST /api/transfer: Transfer cryptocurrency to an external address
* GET /api/users/:username: Get user details by username
* GET /api/transactions/user/:username: Get all transactions for a user by username
* GET /api/transactions/:transactionId: Get details of a specific transaction
* GET /api/orders/active: Get all active orders with details 

## Project Structure

* config/: Database connection configuration
* controllers/: API controllers for handling requests
* models/: Mongoose schemas and models
* routes/: API routes
* seeders/: Scripts for seeding the database
* index.js: Main application file

## License

© 2025 Thispara. All rights reserved.
