const mongoose = require('mongoose');
const { useLogger } = require('./authentication/passwordBasedAuth');
require('dotenv').config();

const MONGODB_CONNECTION_LINK = process.env.MONGODB_CONNECTION_URL;

function connectToMongoDB() {
  mongoose.connect(MONGODB_CONNECTION_LINK);

  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB sucessfully!!');
  });

  mongoose.connection.on('error', (err) => {
    useLogger('ERROR')(err);
  });
}

module.exports = {
  connectToMongoDB,
};
