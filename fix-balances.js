import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

async function fixBalances() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const UserCollection = mongoose.connection.collection("users");

    const result = await UserCollection.updateMany(
      { $or: [{ balance: { $exists: false } }, { balance: null }] },
      { $set: { balance: 10000 } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);

    const users = await UserCollection.find({}).toArray();
    console.log("\n📊 All Users:");
    users.forEach(u => {
      console.log(`- ${u.username} (${u.email}): ₹${u.balance || 0}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

fixBalances();
