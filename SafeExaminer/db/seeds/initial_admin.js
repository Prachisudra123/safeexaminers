// This file seeds the database with an initial admin user for the SafeExaminer application.

const mongoose = require('mongoose');
const User = require('../../db/models/User.model');

const initialAdmin = {
    username: 'admin',
    password: 'securepassword', // Ensure to hash this password in production
    email: 'admin@safeexaminer.com',
    role: 'Super Admin',
};

async function seedInitialAdmin() {
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Check if the admin user already exists
        const existingAdmin = await User.findOne({ email: initialAdmin.email });
        if (existingAdmin) {
            console.log('Admin user already exists. Skipping seed.');
            return;
        }

        // Create the initial admin user
        const adminUser = new User(initialAdmin);
        await adminUser.save();
        console.log('Initial admin user created successfully.');
    } catch (error) {
        console.error('Error seeding initial admin user:', error);
    } finally {
        // Close the database connection
        mongoose.connection.close();
    }
}

// Execute the seeding function
seedInitialAdmin();