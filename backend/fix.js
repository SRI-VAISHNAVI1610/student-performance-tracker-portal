const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  
  console.log('=== CHECKING COLLECTIONS ===');
  const cols = await db.listCollections().toArray();
  console.log('Collections:', cols.map(c => c.name));

  // Check studentprofiles collection
  const profiles = await db.collection('studentprofiles').find({}).toArray();
  console.log('StudentProfiles count:', profiles.length);
  if (profiles.length > 0) {
    console.log('Sample profile keys:', Object.keys(profiles[0]));
    console.log('Sample profile:', JSON.stringify(profiles[0], null, 2));
  }

  // Check students collection
  const students = await db.collection('students').find({}).toArray();
  console.log('Students count:', students.length);

  // Check subjects
  const subjects = await db.collection('subjects').find({}).toArray();
  console.log('Subjects count:', subjects.length);
  subjects.forEach(s => console.log('Subject:', s.subjectName, '| staffId:', s.staffId, '| teacherId:', s.teacherId));

  // Get staff user
  const staffUser = await db.collection('users').findOne({role: 'staff'});
  console.log('Staff ID:', staffUser._id);

  // Fix 1: Copy studentprofiles to students collection if students is empty
  if (students.length === 0 && profiles.length > 0) {
    console.log('=== COPYING PROFILES TO STUDENTS ===');
    for (const profile of profiles) {
      await db.collection('students').insertOne({
        ...profile,
        name: profile.name || profile.fullName,
        studentId: profile.studentId || profile.rollNumber,
        rollNumber: profile.rollNumber || profile.studentId,
        year: profile.year || 2,
        semester: profile.semester || 3,
        department: profile.department || 'Computer Science'
      });
    }
    console.log('✅ Copied', profiles.length, 'profiles to students');
  }

  // Fix 2: Fix subject staffId/teacherId mismatch
  console.log('=== FIXING SUBJECTS ===');
  await db.collection('subjects').updateMany(
    { staffId: staffUser._id },
    { $set: { teacherId: staffUser._id } }
  );
  await db.collection('subjects').updateMany(
    { teacherId: staffUser._id },
    { $set: { staffId: staffUser._id } }
  );
  console.log('✅ Subjects fixed - both staffId and teacherId set');

  // Fix 3: Fix role case in students filter
  // Update studentController to use lowercase role
  console.log('=== CHECKING STUDENT ROLES ===');
  const allUsers = await db.collection('users').find({}).toArray();
  allUsers.forEach(u => console.log(u.name, '| role:', u.role));

  // Verify final state
  console.log('=== FINAL STATE ===');
  const finalStudents = await db.collection('students').find({}).toArray();
  console.log('Total students:', finalStudents.length);
  finalStudents.forEach(s => console.log(
    'Name:', s.name || s.fullName,
    '| ID:', s.studentId || s.rollNumber,
    '| Dept:', s.department
  ));

  mongoose.disconnect();
  console.log('=== DONE ===');
});