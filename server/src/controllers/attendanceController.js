const mongoose = require('mongoose');
const { Attendance, Subject, User, Notification } = require('../models');
const { sendDualNotification } = require('../services/emailService');
const attendanceAlertService = require('../services/attendanceAlertService');

async function markAttendance(req, res) {
  try {
    const { subjectCode, facultyId, sessionStudents = [] } = req.body;

    if (!subjectCode || !Array.isArray(sessionStudents) || sessionStudents.length === 0) {
      return res.status(400).json({ error: 'subjectCode and sessionStudents are required' });
    }

    const subject = await Subject.findOne({ code: subjectCode }).lean();
    const subjectName = subject?.name || subjectCode;

    const currentFacultyId = facultyId || req.user?._id;

    const attendanceOperations = sessionStudents.map((student) => {
      const studentId = student.studentId; // This should be the student's _id
      const present = Boolean(student.present);

      return Attendance.findOneAndUpdate(
        { studentId, subjectCode },
        [
          {
            $set: {
              studentId,
              subject: subjectName,
              subjectCode,
              branch: student.branch,
              semester: student.semester,
              attended: { $add: [{ $ifNull: ['$attended', 0] }, (present ? 1 : 0)] },
              total: { $add: [{ $ifNull: ['$total', 0] }, 1] },
              faculty: currentFacultyId,
              credits: student.credits || subject?.credits || 3,
              lastUpdated: new Date()
            }
          },
          {
            $set: {
              percentage: {
                $round: [
                  { $multiply: [{ $divide: ['$attended', '$total'] }, 100] },
                  1
                ]
              }
            }
          }
        ],
        { upsert: true, new: true }
      );
    });

    await Promise.all(attendanceOperations);

    if (attendanceAlertService && attendanceAlertService.checkAndAlert) {
      await attendanceAlertService.checkAndAlert(sessionStudents, subjectCode);
    }

    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
}

async function notifyAtRiskStudent(req, res) {
  try {
    const { studentId, subjectCode } = req.body;

    if (!studentId || !subjectCode) {
      return res.status(400).json({ error: 'studentId and subjectCode are required' });
    }

    const student = await User.findById(studentId).lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (!student.email || !student.parentEmail) {
      return res.status(400).json({ error: 'Student email or parent email missing' });
    }

    const attendanceRecord = await Attendance.findOne({
      studentId: student._id,
      subjectCode,
    }).lean();

    const attendancePercentage = Number(attendanceRecord?.percentage || 0);
    const subject = await Subject.findOne({ code: subjectCode }).lean();
    const subjectName = subject?.name || subjectCode;
    const date = new Date().toLocaleDateString();

    await sendDualNotification(student, subjectName, attendancePercentage, date);

    await Notification.create({
      userId: student._id,
      type: 'attendance_alert',
      title: `Attendance Alert — ${subjectName}`,
      message: `Alert sent to you and your parent for ${subjectName}. Current attendance: ${attendancePercentage}%`,
      read: false,
    });

    return res.json({ message: 'Emails sent to student and parent' });
  } catch (e) {
    console.error('Notify At Risk Error:', e);
    return res.status(500).json({ error: 'Failed to send dual notification' });
  }
}
async function getAttendanceAnalytics(req, res) {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ studentId }).lean();
    if (!records.length) return res.json({ records: [], avgPercentage: 0, suggestions: [] });

    const analytics = records.map(r => {
      let risk = 'safe';
      if (r.percentage < 65) risk = 'high';
      else if (r.percentage < 75) risk = 'medium';
      const safeLeaves = r.percentage >= 75 ? Math.floor((r.attended - 0.75 * r.total) / 0.75) : 0;
      const classesNeeded = r.percentage < 75 ? Math.ceil((0.75 * r.total - r.attended) / 0.25) : 0;
      return { subject: r.subject, subjectCode: r.subjectCode, attended: r.attended, total: r.total, percentage: r.percentage, risk, safeLeaves: Math.max(0, safeLeaves), classesNeeded };
    });

    const avgPercentage = analytics.reduce((a, b) => a + b.percentage, 0) / analytics.length;
    const highRisk = analytics.filter(a => a.risk === 'high');
    const mediumRisk = analytics.filter(a => a.risk === 'medium');
    const suggestions = [];
    if (highRisk.length) suggestions.push(`🔴 URGENT: ${highRisk.map(h => h.subject).join(', ')} — attend every class immediately!`);
    if (mediumRisk.length) suggestions.push(`🟡 WARNING: ${mediumRisk.map(m => m.subject).join(', ')} — you can only miss 1-2 more classes.`);
    if (avgPercentage >= 75) suggestions.push(`✅ Overall attendance is good at ${avgPercentage.toFixed(1)}%. Keep it up!`);

    res.json({ records: analytics, avgPercentage, suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

module.exports = { markAttendance, notifyAtRiskStudent, getAttendanceAnalytics };
