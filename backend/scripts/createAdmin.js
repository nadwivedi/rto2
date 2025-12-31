const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const Admin = require('../models/Admin');
require('dotenv').config({ path: '../.env' });

const createAdmin = async (email, password) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email,
      password: hashedPassword,
    });

    await admin.save();

    console.log('Admin created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

const emailArg = process.argv[2];
const passwordArg = process.argv[3];

if (emailArg && passwordArg) {
  createAdmin(emailArg, passwordArg);
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter email: ', (email) => {
    rl.question('Enter password: ', (password) => {
      if (!email || !password) {
        console.log('Email and password are required.');
        rl.close();
        process.exit(1);
      }
      createAdmin(email, password);
      rl.close();
    });
  });
}