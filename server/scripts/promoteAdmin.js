import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
dotenv.config();
const email = process.argv[2]?.trim().toLowerCase();
if (!email) { console.error('Usage: npm run make-admin -- user@example.com'); process.exit(1); }
try {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!user) { console.error(`No account found for ${email}. Register this account in RentNest first.`); process.exitCode = 1; }
  else console.log(`Admin role assigned to ${user.email}. Log out and log in again in the frontend.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
