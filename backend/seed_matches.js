const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Item = require('./models/Item');
const FoundItem = require('./models/FoundItem');

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in .env file');
      process.exit(1);
    }
    
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected successfully.');

    // 1. Fetch a user to act as the reporter
    const user = await User.findOne({});
    if (!user) {
      console.error('No users found in the database. Please register a user first.');
      process.exit(1);
    }
    console.log(`Using user: ${user.name} (${user.role}) as reporter.`);

    // 2. Clear old test data for these specific titles to avoid pollution
    console.log('Cleaning up old test items...');
    await Item.deleteMany({ title: { $in: ['Black iPhone 13 Pro'] } });
    await FoundItem.deleteMany({ title: { $in: ['iPhone 13 Pro Black', 'cracked screen iPhone', 'Black phone', 'Leather Wallet'] } });

    // 3. Create Target Lost Item
    console.log('Seeding target Lost Item...');
    const lostItem = await Item.create({
      title: 'Black iPhone 13 Pro',
      description: 'Lost apple iphone 13 pro, black color, cracked back screen glass, has some stickers on it.',
      category: 'Lost',
      location: 'Library Cafe',
      date: new Date('2026-05-20T10:00:00.000Z'),
      status: 'lost',
      user: user._id
    });
    console.log(`Lost Item seeded: ${lostItem.title} (${lostItem._id})`);

    // 4. Create Candidate Found Items
    console.log('Seeding candidate Found Items...');
    const candidates = [
      {
        title: 'iPhone 13 Pro Black',
        description: 'Found black apple iphone 13 pro in library cafe area. Back glass is cracked.',
        category: 'Found',
        location: 'Library Cafe',
        dateFound: new Date('2026-05-20T14:00:00.000Z'),
        status: 'found',
        user: user._id
      },
      {
        title: 'cracked screen iPhone',
        description: 'Found a black iphone with cracked back screen.',
        category: 'Found',
        location: 'Library',
        dateFound: new Date('2026-05-21T09:00:00.000Z'),
        status: 'found',
        user: user._id
      },
      {
        title: 'Black phone',
        description: 'Found phone in cafe.',
        category: 'Found',
        location: 'Central Cafe',
        dateFound: new Date('2026-05-18T18:00:00.000Z'),
        status: 'found',
        user: user._id
      },
      {
        title: 'Leather Wallet',
        description: 'Brown leather wallet found with IDs.',
        category: 'Found',
        location: 'Gym',
        dateFound: new Date('2026-05-20T12:00:00.000Z'),
        status: 'found',
        user: user._id
      }
    ];

    await FoundItem.insertMany(candidates);
    console.log('Successfully seeded candidate Found Items.');
    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding matching data:', error);
    process.exit(1);
  }
};

run();
