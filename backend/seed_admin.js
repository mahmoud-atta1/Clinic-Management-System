const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/clinic-management');
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Delete existing test emails to avoid conflicts
    await users.deleteMany({ email: { $in: ['admin@clinic.com', 'mahmoud@example.com'] } });

    await users.insertOne({
      fullName: 'System Admin',
      email: 'admin@clinic.com',
      password: hashedPassword,
      phone: '01000000001',
      role: 'admin',
      gender: 'male',
      dateOfBirth: new Date('1990-01-01'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created fresh admin: admin@clinic.com / password123');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
