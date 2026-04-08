import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateStudentReport = (studentData) => {
  const doc = new jsPDF();
  
  // Extract robust tracking identifiers
  const name = studentData?.name || studentData?.profile?.fullName || studentData?.profile?.name || 'No Data Available';
  const roll = studentData?.rollNumber || studentData?.profile?.rollNumber || studentData?.profile?.studentId || 'No Data Available';
  const dept = studentData?.department || studentData?.profile?.department || 'No Data Available';
  const sem = studentData?.semester || studentData?.profile?.semester || 'No Data Available';

  // Extract raw arrays safely
  const marksArr = studentData?.marks || studentData?.raw?.marks || [];
  const attArr = studentData?.attendance || studentData?.raw?.attendance || [];
  const actArr = studentData?.activities || studentData?.raw?.activities || [];

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INSTITUTIONAL PERFORMANCE DOSSIER', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Unified Academic Record', 105, 28, { align: 'center' });
  
  // Student Info Block
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Scholar Name: ${name}`, 20, 45);
  doc.text(`Roll Number: ${roll}`, 20, 53);
  doc.text(`Department: ${dept}`, 20, 61);
  doc.text(`Academic Term: Semester ${sem}`, 120, 45);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 120, 53);
  
  // -----------------------------------------------------
  // 1. ATTENDANCE AGGREGATION & TABLE
  // -----------------------------------------------------
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Section I: Course Attendance Matrix', 20, 80);
  
  let overallTotalClasses = 0;
  let overallPresentClasses = 0;

  // Group by Subject
  const attMap = {};
  attArr.forEach(record => {
      const subjectName = record.subjectId?.subjectName || record.subjectName || record.subject || 'No Data Available';
      
      if (!attMap[subjectName]) {
          attMap[subjectName] = { total: 0, present: 0, absent: 0 };
      }
      
      attMap[subjectName].total += 1;
      overallTotalClasses += 1;

      if (record.status === 'present') {
          attMap[subjectName].present += 1;
          overallPresentClasses += 1;
      } else if (record.status === 'absent') {
          attMap[subjectName].absent += 1;
      }
  });

  const attendanceRows = Object.keys(attMap).map(subject => {
      const { total, present, absent } = attMap[subject];
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      let status = 'DETAINED';
      if (percentage >= 75) status = 'SAFE';
      else if (percentage >= 65) status = 'AT RISK';

      return [subject, total, present, absent, `${percentage}%`, status];
  });

  if (attendanceRows.length === 0) {
      attendanceRows.push([{ content: 'No Data Available', colSpan: 6, styles: { halign: 'center', textColor: [150, 150, 150] } }]);
  }

  autoTable(doc, {
    startY: 85,
    headStyles: { fillColor: [79, 70, 229] }, // indigo-600
    head: [['Subject / Course Title', 'Total', 'Present', 'Absent', 'Percentage', 'Status']],
    body: attendanceRows,
    didParseCell: (data) => {
      if (data.column.index === 5 && typeof data.cell.raw === 'string') {
        const val = data.cell.raw;
        if (val === 'SAFE') data.cell.styles.textColor = [16, 185, 129];      // emerald
        if (val === 'AT RISK') data.cell.styles.textColor = [245, 158, 11]; // amber
        if (val === 'DETAINED') data.cell.styles.textColor = [239, 68, 68];  // red
      }
    }
  });
  
  // -----------------------------------------------------
  // 2. ACADEMIC MARKS TABLE
  // -----------------------------------------------------
  const marksY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Section II: Academic Valuations', 20, marksY);
  
  let gpaAccumulator = 0;
  let subjectCount = 0;

  const marksMap = {};
  marksArr.forEach(m => {
      const subjectName = m.subjectId?.subjectName || m.subjectName || m.subjectCode || 'No Data Available';
      
      // Keep only most recent or highest entry, we will simply replace assuming later drops overwrite or we capture sums natively.
      marksMap[subjectName] = {
          i1: m.internal1 || 0,
          i2: m.internal2 || 0,
          semExam: m.semesterExam || 0,
          totalScore: m.total || ((m.internal1 || 0) + (m.internal2 || 0) + (m.semesterExam || 0)),
          averageScore: m.average || Number(( (m.total || ((m.internal1 || 0) + (m.internal2 || 0) + (m.semesterExam || 0))) / 3 ).toFixed(2))
      };
  });

  const marksRows = Object.keys(marksMap).map(subject => {
      const { i1, i2, semExam, totalScore, averageScore } = marksMap[subject];

      // Subject-wise GPA (Total mapped to 10 points dynamically)
      gpaAccumulator += (totalScore / 10);
      subjectCount += 1;

      const gradeStatus = totalScore >= 50 ? 'PASS' : 'FAIL';

      return [
          subject,
          i1,
          i2,
          semExam,
          totalScore,
          averageScore,
          gradeStatus
      ];
  });

  if (marksRows.length === 0) {
      marksRows.push([{ content: 'No Data Available', colSpan: 7, styles: { halign: 'center', textColor: [150, 150, 150] } }]);
  }

  autoTable(doc, {
    startY: marksY + 5,
    headStyles: { fillColor: [15, 23, 42] }, // slate-900
    head: [['Subject / Course Title', 'Int 1', 'Int 2', 'Sem Exam', 'Total', 'Avg', 'Status']],
    body: marksRows,
    didParseCell: (data) => {
      if (data.column.index === 6 && typeof data.cell.raw === 'string') {
        const val = data.cell.raw;
        if (val === 'PASS') data.cell.styles.textColor = [16, 185, 129];
        if (val === 'FAIL') data.cell.styles.textColor = [239, 68, 68];
      }
    }
  });

  // -----------------------------------------------------
  // 3. PERFORMANCE SUMMARY (DYNAMIC CALCULATIONS)
  // -----------------------------------------------------
  
  // Calculate final CGPA natively
  const computedCGPA = subjectCount > 0 ? (gpaAccumulator / subjectCount).toFixed(2) : 'N/A';
  
  // Calculate final Attendance natively
  const overallAttPercentage = overallTotalClasses > 0 ? Math.round((overallPresentClasses / overallTotalClasses) * 100) : 0;
  
  // Calculate final Activity XP
  const computedXP = actArr.reduce((sum, act) => sum + (act.points || 0), 0);
  
  // Standing Judgment
  let standing = 'POOR';
  if (computedCGPA >= 8 && overallAttPercentage >= 80) standing = 'EXCELLENT';
  else if (computedCGPA >= 6 && overallAttPercentage >= 75) standing = 'GOOD';
  else if (computedCGPA >= 5 && overallAttPercentage >= 65) standing = 'AVERAGE';
  else if (subjectCount === 0 && overallTotalClasses === 0) standing = 'N/A (No Data)';

  const sumY = doc.lastAutoTable.finalY + 15;
  
  // Check if we need to add a new page before drawing summary
  if (sumY > 260) {
      doc.addPage();
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Section III: Institutional Summary', 20, sumY > 260 ? 20 : sumY);
  
  autoTable(doc, {
    startY: (sumY > 260 ? 25 : sumY + 5),
    headStyles: { fillColor: [56, 189, 248] }, // sky-400
    head: [['Metric Assessment', 'Verified Value']],
    body: [
      ['Dynamic Core CGPA (10pt Scale)', computedCGPA !== 'N/A' ? `${computedCGPA} / 10` : 'No Data Available'],
      ['Aggregate Course Attendance', overallTotalClasses > 0 ? `${overallAttPercentage}%` : 'No Data Available'],
      ['Co-Curricular XP / Credits', computedXP > 0 ? computedXP : 'No Data Available'],
      ['Academic Standing Verdict', standing]
    ]
  });
  
  doc.save(`${roll}_Unified_Dossier.pdf`);
};
