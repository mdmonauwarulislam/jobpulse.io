const mongoose = require('../backend/node_modules/mongoose');
const dotenv = require('../backend/node_modules/dotenv');
const User = require('../backend/models/User');

// Load env vars
dotenv.config({ path: '../backend/.env' });

const createAdmin = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const adminEmail = process.argv[2] || 'mhdasif2580@gmail.com';
    const adminPassword = process.argv[3] || 'Admin@1234';
    const adminName = process.argv[4] || 'Mannu';

    // Check if user exists
    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
      console.log('User already exists. Updating role to admin...');
      userExists.role = 'admin';
      userExists.isVerified = true;
      await userExists.save();
      console.log('User updated to admin successfully');
    } else {
      console.log('Creating new admin user...');
      const user = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true
      });
      console.log(`Admin user created with ID: ${user._id}`);
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (!process.env.MONGO_URI) {
  // If dotenv didn't load (e.g. running from wrong dir), try hardcoded path or ask user
  console.log('MONGO_URI not found. Please ensure .env file exists in backend directory.');
  console.log('Usage: node create_admin.js <email> <password> <name>');
} else {
  createAdmin();
}
