const mongoose = require("mongoose");
const Hall = require("../src/models/Hall").default;

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/weenyou");
  const result = await Hall.updateMany(
    { platformFeePercent: { $exists: false } },
    { $set: { platformFeePercent: 10 } }
  );
  console.log("Updated halls:", result.modifiedCount);
  await mongoose.disconnect();
})(); 