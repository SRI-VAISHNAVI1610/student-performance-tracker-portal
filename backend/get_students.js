const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/student-performance-tracker').then(async () => {
    const users = await mongoose.connection.db.collection('users').find({ role: 'student' }).toArray();
    console.log("=== STUDENT ACCOUNTS ===");
    users.forEach(u => console.log(`Email: ${u.email} | Default Password: password123 (or what you set)`));
    
    // Check if there are other seeded accounts
    const all = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log("\n=== ALL ACCOUNTS ===");
    all.forEach(u => console.log(`Role: ${u.role} | Email: ${u.email}`));
    
    process.exit(0);
});
