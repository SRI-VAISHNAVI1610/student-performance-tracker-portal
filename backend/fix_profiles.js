const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const StudentProfile = require('./models/Student');

dotenv.config();
connectDB();

const fixProfiles = async () => {
    try {
        console.log('Starting Auto-Fix for Student Profiles...');
        
        const students = await StudentProfile.find({});
        console.log(`Found ${students.length} student profiles to check.`);

        let fixedCount = 0;

        for (const profile of students) {
            // Trim and uppercase the profile roll number just in case
            const normalizedRoll = profile.rollNumber.trim().toUpperCase();
            if (normalizedRoll !== profile.rollNumber) {
                profile.rollNumber = normalizedRoll;
                await profile.save();
                console.log(`Normalized rollNumber for ${profile.fullName}`);
            }

            // Find User by name or by assuming their password/email maps.
            // Best way: find by role 'student' and name matches profile.fullName
            // Or if user email prefix matches rollNumber
            
            // Let's find all student users
            const users = await User.find({ role: 'student' });
            
            // Match logic:
            // 1. Exact name match
            // 2. Or email contains rollNumber (ignoring case)
            // 3. Or email prefix matches name
            let mappedUser = users.find(u => 
                u.name.toLowerCase().trim() === profile.fullName.toLowerCase().trim() ||
                u.email.toLowerCase().includes(normalizedRoll.toLowerCase())
            );

            // If not found, let's just check if there's any user whose _id is already assigned (maybe it is correct)
            if (!mappedUser) {
                mappedUser = await User.findById(profile.studentUserId);
            }

            if (mappedUser) {
                if (profile.studentUserId?.toString() !== mappedUser._id.toString()) {
                    console.log(`Fixing Mapping for ${profile.fullName} -> maps to User ${mappedUser.email}`);
                    profile.studentUserId = mappedUser._id;
                    await profile.save();
                    fixedCount++;
                } else {
                    console.log(`[OK] Profile ${profile.fullName} is already correctly mapped to ${mappedUser.email}`);
                }
            } else {
                console.warn(`[WARNING] No matching user found for profile: ${profile.fullName} (${profile.rollNumber})`);
            }
        }

        console.log(`Auto-Fix Completed. Fixed ${fixedCount} profiles.`);
        process.exit();
    } catch (error) {
        console.error(`Error fixing data: ${error.message}`);
        process.exit(1);
    }
};

fixProfiles();
