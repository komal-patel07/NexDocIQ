import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

console.log("Attempting to connect to MongoDB URI:", uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log("SUCCESS! Connected to MongoDB.");
  process.exit(0);
})
.catch(err => {
  console.error("FAILED TO CONNECT.");
  console.error("Error Name:", err.name);
  console.error("Error Message:", err.message);
  if (err.code) console.error("Error Code:", err.code);
  process.exit(1);
});
