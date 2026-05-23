const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Item = require('./models/Item');
const FoundItem = require('./models/FoundItem');
const ClaimRequest = require('./models/ClaimRequest');
const Report = require('./models/Report');

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in .env file');
      process.exit(1);
    }
    
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected successfully.');

    // 1. Fetch a user to act as the reporter/claimer/owner
    const user = await User.findOne({});
    if (!user) {
      console.error('No users found in the database. Please register a user first.');
      process.exit(1);
    }
    console.log(`Using user: ${user.name} (${user.role}) as reporter/claimer.`);

    // 2. Fetch an Item and a FoundItem
    let item = await Item.findOne({});
    if (!item) {
      console.log('No Lost items found. Creating a mock Lost item...');
      item = await Item.create({
        title: 'Mock Lost Wallet',
        description: 'Black leather wallet with IDs',
        category: 'Lost',
        location: 'Central Park',
        date: new Date(),
        status: 'lost',
        user: user._id
      });
    }

    let foundItem = await FoundItem.findOne({});
    if (!foundItem) {
      console.log('No Found items found. Creating a mock Found item...');
      foundItem = await FoundItem.create({
        title: 'Mock Found iPhone 13',
        description: 'Blue iPhone 13 found near cafe',
        category: 'Found',
        location: 'Starbucks 5th Ave',
        dateFound: new Date(),
        status: 'found',
        user: user._id
      });
    }

    console.log(`Using Item: ${item.title} (${item._id})`);
    console.log(`Using FoundItem: ${foundItem.title} (${foundItem._id})`);

    // 3. Clear existing Reports and insert mock reports
    console.log('Clearing old reports...');
    await Report.deleteMany({});

    console.log('Seeding mock reports...');
    const reports = [
      {
        item: item._id,
        itemModel: 'Item',
        reporter: user._id,
        reason: 'Spam listing, duplicates post multiple times.',
        status: 'pending'
      },
      {
        item: foundItem._id,
        itemModel: 'FoundItem',
        reporter: user._id,
        reason: 'Inappropriate language in description.',
        status: 'pending'
      },
      {
        item: item._id,
        itemModel: 'Item',
        reporter: user._id,
        reason: 'Scam alert: requester demands money upfront for returns.',
        status: 'urgent'
      },
      {
        item: foundItem._id,
        itemModel: 'FoundItem',
        reporter: user._id,
        reason: 'Duplicate listing from other reporter.',
        status: 'resolved'
      },
      {
        item: item._id,
        itemModel: 'Item',
        reporter: user._id,
        reason: 'Incorrect item details reported.',
        status: 'rejected'
      }
    ];

    await Report.insertMany(reports);
    console.log('Successfully seeded 5 mock Reports.');

    // 4. Ensure we have some claims with varying statuses to populate claims distribution chart
    const claimCount = await ClaimRequest.countDocuments({});
    if (claimCount < 5) {
      console.log('Seeding mock ClaimRequests to test claims distribution chart...');
      
      // Let's create an owner user if we only have one user, since claimer cannot be the owner.
      let anotherUser = await User.findOne({ email: { $ne: user.email } });
      if (!anotherUser) {
        console.log('Creating a second mock user for claim lifecycle flow...');
        anotherUser = await User.create({
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          password: 'Password123!',
          role: 'user'
        });
      }

      await ClaimRequest.create([
        {
          item: item._id,
          itemModel: 'Item',
          claimer: user._id,
          owner: anotherUser._id,
          message: 'I lost my black leather wallet with my ID in Central Park.',
          status: 'pending'
        },
        {
          item: item._id,
          itemModel: 'Item',
          claimer: user._id,
          owner: anotherUser._id,
          message: 'It has my initials on the back, here is the proof.',
          status: 'approved'
        },
        {
          item: foundItem._id,
          itemModel: 'FoundItem',
          claimer: anotherUser._id,
          owner: user._id,
          message: 'My iPhone is blue and has a red case.',
          status: 'approved'
        },
        {
          item: foundItem._id,
          itemModel: 'FoundItem',
          claimer: anotherUser._id,
          owner: user._id,
          message: 'No proof provided, incorrect description.',
          status: 'rejected'
        }
      ]);
      console.log('Seeded mock ClaimRequests.');
    } else {
      console.log(`Database already has ${claimCount} claim requests. Skipping claims seeding.`);
    }

    console.log('All mock data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

run();
