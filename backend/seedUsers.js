const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const users = [
  {
    name: 'Admin User',
    email: 'admin@fieldsync.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Arjun Kumar',
    email: 'arjun@fieldsync.com',
    password: 'worker123',
    role: 'worker',
    region: 'Kurnool',
    isActive: true
  },
  {
    name: 'Sunita Rao',
    email: 'sunita@fieldsync.com',
    password: 'worker123',
    role: 'worker',
    region: 'Guntur',
    isActive: true
  },
  {
    name: 'Mahesh Naidu',
    email: 'mahesh@fieldsync.com',
    password: 'worker123',
    role: 'worker',
    region: 'East',
    isActive: true
  },
  {
    name: 'Lakshmi Patel',
    email: 'lakshmi@fieldsync.com',
    password: 'worker123',
    role: 'worker',
    region: 'Nalgonda',
    isActive: true
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');
    
    // Create users
    for (let user of users) {
      const newUser = new User(user);
      await newUser.save();
      console.log(`✅ Created user: ${user.name} (${user.role})`);
    }
    
    console.log('🎉 Users seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();