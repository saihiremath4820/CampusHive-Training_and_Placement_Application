const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existingAdmin = await User.findOne({ email: 'admin@pict.edu' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'Super Admin',
        email: 'admin@pict.edu',
        password: hashedPassword,
        role: 'admin',
        collegeId: 'PICT2028',
        status: 'approved'
      });
      console.log('Admin created successfully.');
    } else {
      console.log('Admin already exists.');
      
      // Update its password to be sure
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Admin password updated to Admin@123.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
}
createAdmin();
