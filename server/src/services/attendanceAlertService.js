const { Attendance, Subject, Notification } = require('../models');
const { emitToUser } = require('./notificationService');

async function checkAndAlert(students, subjectCode) {
  const threshold = Number(process.env.ATTENDANCE_THRESHOLD || 75);
  const subject = await Subject.findOne({ code: subjectCode }).lean();
  const subjectName = subject?.name || subjectCode;

  await Promise.all(
    students.map(async (student) => {
      const studentId = student.studentId || student.id || student.userId;
      if (!studentId) return;

      const records = await Attendance.find({ studentId, subjectCode }).lean();
      const totalCount = records.length;
      const presentCount = records.filter((r) => Number(r.present ?? r.attended ?? 0) > 0).length;

      const percentage = totalCount > 0 ? Number(((presentCount / totalCount) * 100).toFixed(1)) : 0;
      if (percentage >= threshold) return;

      const message = `⚠️ Your attendance in ${subjectName} is now ${percentage}%. You are at risk of shortage.`;

      await Notification.create({
        id: `NTF_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId: studentId,
        message,
        title: 'Attendance Alert',
        type: 'attendance_alert',
        read: false,
        createdAt: new Date().toISOString(),
      });

      emitToUser(studentId, 'attendance:alert', {
        subjectName,
        percentage,
        message,
      });
    }),
  );
}

module.exports = { checkAndAlert };
