const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const StudentProfile = require('./models/Student');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
const Mark = require('./models/Mark');
const ActivityPoints = require('./models/Activity');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        console.log('Clearing existing data...');
        await Promise.all([
            User.deleteMany(),
            StudentProfile.deleteMany(),
            Subject.deleteMany(),
            Attendance.deleteMany(),
            Mark.deleteMany(),
            ActivityPoints.deleteMany()
        ]);

        console.log('Creating Admin & Staff...');
        const adminUser = await User.create({
            name: 'System Admin',
            email: 'admin@college.edu',
            password: 'password123',
            role: 'admin'
        });

        const staffUser = await User.create({
            name: 'Senior Professor',
            email: 'staff@college.edu',
            password: 'password123',
            role: 'staff'
        });

        console.log('Creating Subjects...');
        const subjects = await Subject.insertMany([
            { subjectCode: 'CS301', subjectName: 'Data Structures', department: 'Computer Science', semester: 3, credits: 4, staffId: staffUser._id },
            { subjectCode: 'CS302', subjectName: 'Object Oriented Programming', department: 'Computer Science', semester: 3, credits: 4, staffId: staffUser._id },
            { subjectCode: 'CS303', subjectName: 'Database Management', department: 'Computer Science', semester: 3, credits: 4, staffId: staffUser._id }
        ]);

        console.log('Creating Students & Parents...');
        const studentData = [
            {
                name: 'MUGILAN', rollNumber: '22CS001', email: 'mugilan@college.edu', pwd: '22CS001',
                pEmail: 'mugilan.parent@gmail.com', pPwd: '22CS001parent', 
                dept: 'Computer Science', year: '2', sem: 3,
                att: { present: 18, absent: 2 },
                marks: { int1: 18, int2: 17, prac: 45, sem: 82 }
            },
            {
                name: 'SRI VAISHNAVI', rollNumber: '22CS002', email: 'srivaishnavi@college.edu', pwd: '22CS002',
                pEmail: 'srivaishnavi.parent@gmail.com', pPwd: '22CS002parent', 
                dept: 'Computer Science', year: '2', sem: 3,
                att: { present: 16, absent: 4 },
                marks: { int1: 16, int2: 15, prac: 42, sem: 78 }
            },
            {
                name: 'ADHAV', rollNumber: '22CS003', email: 'adhav@college.edu', pwd: '22CS003',
                pEmail: 'adhav.parent@gmail.com', pPwd: '22CS003parent', 
                dept: 'Computer Science', year: '2', sem: 3,
                att: { present: 14, absent: 6 },
                marks: { int1: 14, int2: 13, prac: 38, sem: 71 }
            }
        ];

        for (const s of studentData) {
            // Parent
            const parentUser = await User.create({
                name: `${s.name} Parent`, email: s.pEmail, password: s.pPwd, role: 'parent'
            });

            // Student User
            const studentUser = await User.create({
                name: s.name, email: s.email, password: s.pwd, role: 'student'
            });

            // Profile
            await StudentProfile.create({
                rollNumber: s.rollNumber.trim().toUpperCase(),
                studentUserId: studentUser._id,
                fullName: s.name,
                department: s.dept,
                semester: s.sem,
                batchYear: '2022',
                phone: '9876543210',
                parentUserId: parentUser._id
            });

            console.log(`Generating Attendance & Marks for ${s.name}...`);
            const today = new Date();
            for (const sub of subjects) {
                // Marks
                const maxMarksMap = { internal1: 20, internal2: 20, assignment: 20, external: 100 };
                const markTypes = [
                    { t: 'internal1', v: s.marks.int1, m: 20 },
                    { t: 'internal2', v: s.marks.int2, m: 20 },
                    { t: 'assignment', v: s.marks.prac, m: 50 }, // using assignment for practical as per enum ['internal1', 'internal2', 'assignment', 'external']
                    { t: 'external', v: s.marks.sem, m: 100 }
                ];

                for (const mt of markTypes) {
                    await Mark.create({
                        rollNumber: s.rollNumber.trim().toUpperCase(),
                        subjectId: sub._id,
                        examType: mt.t,
                        marksObtained: mt.v,
                        maxMarks: mt.m,
                        enteredBy: staffUser._id
                    });
                }

                // Attendance
                for (let i = 0; i < 20; i++) {
                    const status = i < s.att.present ? 'present' : 'absent';
                    const recordDate = new Date(today);
                    recordDate.setDate(today.getDate() - (20 - i)); // Past 20 days

                    await Attendance.create({
                        rollNumber: s.rollNumber.trim().toUpperCase(),
                        subjectId: sub._id,
                        date: recordDate,
                        status: status,
                        markedBy: staffUser._id
                    });
                }
            }
        }

        console.log('Seed completed successfully!');
        process.exit();

    } catch (error) {
        console.error(`Error with seeding data: ${error.message}`);
        process.exit(1);
    }
};

seedData();