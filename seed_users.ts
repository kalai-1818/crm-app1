
import bcrypt from 'bcryptjs';
import User from './backend/models/User.ts';
import { db } from './backend/config/firebase.ts';

const seed = async () => {
  console.log('Using Firestore Database:', (db as any)._databaseId?.database || 'default');
  const users = [
    { name: 'System Admin', email: 'admin@crm.com', password: 'password123', role: 'admin' },
    { name: 'Lead Manager', email: 'manager@crm.com', password: 'password123', role: 'manager' },
    { name: 'Sales Rep', email: 'sales@crm.com', password: 'password123', role: 'sales' },
    { name: 'Technical Head', email: 'tech@crm.com', password: 'password123', role: 'technical' }
  ];

  for (const userData of users) {
    try {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`User ${userData.email} already exists.`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      console.log(`Created user: ${userData.email} (${userData.role})`);
    } catch (err) {
      console.error(`Error creating ${userData.email}:`, err);
    }
  }
  console.log('Seeding complete.');
  process.exit(0);
};

seed();
