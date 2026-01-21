const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Models (Importing via require to ensure schemas are registered)
// We might need to define temporary schemas if the files are changed and we need raw access?
// Actually, using mongoose.connection.db is safer for legacy data.
const User = require('../backend/models/User');
const EmployerProfile = require('../backend/models/EmployerProfile');
const CandidateProfile = require('../backend/models/CandidateProfile');
const Job = require('../backend/models/Job');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('DB Connection Error:', error);
    process.exit(1);
  }
};

const migrate = async () => {
  await connectDB();
  const db = mongoose.connection.db;

  console.log('Starting Migration...');

  // 1. Migrate Candidates (Users)
  const usersCollection = db.collection('users');
  const allUsers = await usersCollection.find({}).toArray();

  console.log(`Found ${allUsers.length} users in 'users' collection.`);

  for (const user of allUsers) {
    if (user.role === 'employer') {
        // Skip, we handle employers from 'employers' collection or maybe they are already converted?
        // If current User model has role employer, it might be an admin or new user.
        console.log(`Skipping user ${user.email} (role: employer) - handled separately if needed.`);
        continue;
    }

    // It's a candidate or admin
    console.log(`Processing User (Candidate/Admin): ${user.email}`);

    // Generate userId if missing
    let userId = user.userId;
    if (!userId) {
      userId = uuidv4();
      await usersCollection.updateOne({ _id: user._id }, { $set: { userId: userId } });
      console.log(`  -> Generated userId: ${userId}`);
    }

    // If role is candidate, creating Profile
    if (user.role !== 'admin') { // Default to candidate
        // Check if Profile exists
        const existingProfile = await CandidateProfile.findOne({ user: user._id });
        if (!existingProfile) {
            // Extract fields from user doc
            const profileData = {
                user: user._id,
                userId: userId,
                phone: user.phone,
                address: user.address,
                summary: user.summary,
                education: user.education,
                experience: user.experience,
                skills: user.skills,
                resumeUrl: user.resumeUrl,
                isProfileComplete: user.isProfileComplete
            };
            
            // Create Profile
            await CandidateProfile.create(profileData);
            console.log(`  -> Created CandidateProfile`);
        } else {
            console.log(`  -> CandidateProfile already exists`);
        }
    }
  }

  // 2. Migrate Employers (From legacy 'employers' collection)
  // Check if collection exists
  const collections = await db.listCollections({ name: 'employers' }).toArray();
  if (collections.length > 0) {
      const employersCollection = db.collection('employers');
      const allEmployers = await employersCollection.find({}).toArray();

      console.log(`Found ${allEmployers.length} legacy employers.`);

      for (const emp of allEmployers) {
          console.log(`Processing Legacy Employer: ${emp.email}`);

          // Check if User already exists for this employer
          let user = await User.findOne({ email: emp.email });
          let userId;

          if (!user) {
              console.log(`  -> Creating new User for employer`);
              userId = uuidv4();
              user = await User.create({
                  name: emp.name,
                  email: emp.email,
                  password: emp.password, // Keep hashed password
                  role: 'employer',
                  userId: userId,
                  isVerified: emp.isVerified,
                  isActive: emp.isActive,
                  createdAt: emp.createdAt
              });
          } else {
              userId = user.userId; 
              if (!userId) {
                  userId = uuidv4();
                  user.userId = userId;
                  await user.save({ validateBeforeSave: false });
              }
              console.log(`  -> User already exists for employer`);
          }

          // Create EmployerProfile
          const existingProfile = await EmployerProfile.findOne({ user: user._id });
          let profileId;

          if (!existingProfile) {
              const profile = await EmployerProfile.create({
                  user: user._id,
                  userId: userId,
                  company: emp.company,
                  companyDescription: emp.companyDescription,
                  companyWebsite: emp.companyWebsite,
                  companyLogo: emp.companyLogo,
                  phone: emp.phone,
                  address: emp.address,
                  isProfileComplete: emp.isProfileComplete
              });
              profileId = profile._id;
              console.log(`  -> Created EmployerProfile`);
          } else {
              profileId = existingProfile._id;
              console.log(`  -> EmployerProfile already exists`);
          }

          // Update Jobs associated with this legacy employer
          // Legacy Job 'employer' field pointed to 'employers' collection _id (emp._id)
          const jobsUpdateResult = await Job.updateMany(
              { employer: emp._id }, // Find jobs pointing to old employer ID
              { 
                  $set: { 
                      employer: profileId, // Update to new Profile ID
                      employerUserId: userId // Set public ID
                  }
              }
          );
          
          if (jobsUpdateResult.modifiedCount > 0) {
              console.log(`  -> Updated ${jobsUpdateResult.modifiedCount} jobs to link to new Profile.`);
          }
      }
  } else {
      console.log("No legacy 'employers' collection found.");
  }

  // 3. Cleanup Jobs (ensure employerUserId exists if missed)
  // If jobs were created by 'User' (not legacy Employer), update them too.
  // This handles case where Job.employer pointed to a User (if that was ever the case).
  // Assuming Job.employer logic in past was: 'Reference to User if posted by user, or Employer if posted by employer'.
  
  console.log('Migration Completed.');
  process.exit();
};

migrate();
