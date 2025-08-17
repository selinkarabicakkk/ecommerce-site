import dotenv from 'dotenv';
import connectDB from '../config/db';
import { User } from '../models';
import { hashPassword } from '../utils/passwordUtils';

dotenv.config();

async function ensureAdmin() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const plainPassword = process.env.ADMIN_PASSWORD || 'password123';

  const existing = await User.findOne({ email });
  if (!existing) {
    const password = await hashPassword(plainPassword);
    await User.create({
      email,
      password,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isEmailVerified: true,
    });
    console.log(`Admin created: ${email}`);
  } else {
    existing.password = await hashPassword(plainPassword);
    existing.role = 'admin';
    existing.isEmailVerified = true;
    await existing.save();
    console.log(`Admin ensured and password reset: ${email}`);
  }

  process.exit(0);
}

ensureAdmin().catch((e) => {
  console.error(e);
  process.exit(1);
});


