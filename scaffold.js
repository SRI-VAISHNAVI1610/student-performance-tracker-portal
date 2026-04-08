const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src/pages');

const files = {
    'admin/AdminDashboard.jsx': "import React from 'react';\n\nconst AdminDashboard = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Overview</h1></div>;\nexport default AdminDashboard;",
    'admin/AdminManage.jsx': "import React from 'react';\n\nconst AdminManage = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Create & Assign</h1></div>;\nexport default AdminManage;",
    'admin/AdminHelpDesk.jsx': "import React from 'react';\n\nconst AdminHelpDesk = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Help Desk</h1></div>;\nexport default AdminHelpDesk;",
    
    'staff/StaffOverview.jsx': "import React from 'react';\n\nconst StaffOverview = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Overview</h1></div>;\nexport default StaffOverview;",
    'staff/StaffMarks.jsx': "import React from 'react';\n\nconst StaffMarks = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Marks Entry</h1></div>;\nexport default StaffMarks;",
    'staff/StaffAttendance.jsx': "import React from 'react';\n\nconst StaffAttendance = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Attendance</h1></div>;\nexport default StaffAttendance;",
    'staff/StaffActivities.jsx': "import React from 'react';\n\nconst StaffActivities = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Activity Approval</h1></div>;\nexport default StaffActivities;",
    'staff/StaffReport.jsx': "import React from 'react';\n\nconst StaffReport = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Download Report</h1></div>;\nexport default StaffReport;",

    'student/StudentDashboard.jsx': "import React from 'react';\n\nconst StudentDashboard = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Dashboard</h1></div>;\nexport default StudentDashboard;",
    'student/StudentMarks.jsx': "import React from 'react';\n\nconst StudentMarks = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Marks View</h1></div>;\nexport default StudentMarks;",
    'student/StudentAttendance.jsx': "import React from 'react';\n\nconst StudentAttendance = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Attendance View</h1></div>;\nexport default StudentAttendance;",
    'student/StudentActivities.jsx': "import React from 'react';\n\nconst StudentActivities = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Activity Request</h1></div>;\nexport default StudentActivities;",
    'student/StudentReport.jsx': "import React from 'react';\n\nconst StudentReport = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Download Report</h1></div>;\nexport default StudentReport;",

    'parent/ParentDashboard.jsx': "import React from 'react';\n\nconst ParentDashboard = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Dashboard</h1></div>;\nexport default ParentDashboard;",
    'parent/ParentComplaints.jsx': "import React from 'react';\n\nconst ParentComplaints = () => <div className='p-8'><h1 className='text-3xl font-black text-slate-800'>Issue / Complaint</h1></div>;\nexport default ParentComplaints;",
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(srcDir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    // Don't overwrite if it exists (like old StudentDashboard, but we are moving them to folders)
    fs.writeFileSync(fullPath, content);
    console.log(`Created: ${filePath}`);
}
