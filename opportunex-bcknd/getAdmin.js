const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function getAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await User.find({ role: 'admin' }).select('-password');
    console.log(JSON.stringify(admins, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
}
getAdmins();
