const mongoose = require('mongoose');
require('dotenv').config();
const Opportunity = require('./models/Opportunity');
const User = require('./models/User');

async function migrate() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const opps = await Opportunity.find({ $or: [{ collegeId: { $exists: false } }, { collegeId: "" }] });
    console.log(`Found ${opps.length} opportunities without collegeId`);

    for (const opp of opps) {
        const creator = await User.findById(opp.createdBy);
        if (creator && creator.collegeId) {
            opp.collegeId = creator.collegeId;
            await opp.save();
            console.log(`Updated Opportunity ${opp._id} with collegeId ${creator.collegeId}`);
        } else {
            // Fallback to the main collegeId from seed if creator not found or missing collegeId
            opp.collegeId = "PICT2028";
            await opp.save();
            console.log(`Updated Opportunity ${opp._id} with fallback collegeId PICT2028`);
        }
    }

    console.log("Migration complete");
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
