const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const { User, Feedback, Document } = require('./models/index.js');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');
const ANALYSES_FILE = path.join(DATA_DIR, 'analyses.json');

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/data-explainer';
  console.log(`Connecting to MongoDB at: ${mongoUri}`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connection successful!');

    // 1. Migrate Users
    if (fs.existsSync(USERS_FILE)) {
      try {
        const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        if (Array.isArray(usersData) && usersData.length > 0) {
          console.log(`Found ${usersData.length} users in JSON file. Migrating...`);
          let migratedCount = 0;
          for (const u of usersData) {
            // Remove file-based "id" to prevent collision or store it if needed. 
            // In our User model we don't have an explicit string id field (we use MongoDB's _id),
            // but we can map fields.
            const userObj = {
              username: u.username,
              email: u.email,
              password: u.password
            };
            const result = await User.updateOne(
              { email: userObj.email },
              { $set: userObj },
              { upsert: true }
            );
            if (result.upsertedCount > 0 || result.modifiedCount > 0) {
              migratedCount++;
            }
          }
          console.log(`Migrated/Updated ${migratedCount} users.`);
        }
      } catch (err) {
        console.error('Error parsing/migrating users:', err);
      }
    }

    // 2. Migrate Feedback
    if (fs.existsSync(FEEDBACK_FILE)) {
      try {
        const feedbackData = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
        if (Array.isArray(feedbackData) && feedbackData.length > 0) {
          console.log(`Found ${feedbackData.length} feedback entries in JSON file. Migrating...`);
          let migratedCount = 0;
          for (const f of feedbackData) {
            const feedbackObj = {
              name: f.name,
              email: f.email,
              category: f.category || 'features',
              rating: parseInt(f.rating) || 5,
              comment: f.comment,
              date: f.date ? new Date(f.date) : new Date()
            };
            const result = await Feedback.updateOne(
              { email: feedbackObj.email, comment: feedbackObj.comment },
              { $set: feedbackObj },
              { upsert: true }
            );
            if (result.upsertedCount > 0 || result.modifiedCount > 0) {
              migratedCount++;
            }
          }
          console.log(`Migrated/Updated ${migratedCount} feedback entries.`);
        }
      } catch (err) {
        console.error('Error parsing/migrating feedback:', err);
      }
    }

    // 3. Migrate Documents (Analyses)
    if (fs.existsSync(ANALYSES_FILE)) {
      try {
        const analysesData = JSON.parse(fs.readFileSync(ANALYSES_FILE, 'utf8'));
        const docKeys = Object.keys(analysesData);
        if (docKeys.length > 0) {
          console.log(`Found ${docKeys.length} documents/analyses in JSON file. Migrating...`);
          let migratedCount = 0;
          for (const key of docKeys) {
            const doc = analysesData[key];
            const documentObj = {
              id: doc.id || key,
              name: doc.name,
              type: doc.type,
              size: doc.size,
              extractedText: doc.extractedText || '',
              stats: doc.stats || {}
            };
            const result = await Document.updateOne(
              { id: documentObj.id },
              { $set: documentObj },
              { upsert: true }
            );
            if (result.upsertedCount > 0 || result.modifiedCount > 0) {
              migratedCount++;
            }
          }
          console.log(`Migrated/Updated ${migratedCount} documents.`);
        }
      } catch (err) {
        console.error('Error parsing/migrating documents:', err);
      }
    }

    console.log('Database seeding/migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
