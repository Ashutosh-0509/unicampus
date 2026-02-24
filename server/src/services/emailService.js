const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendDualNotification(student, subjectName, percentage, date) {
  const studentMail = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: `Attendance Alert — ${subjectName}`,
    text: `Dear ${student.name}, you were marked absent for ${subjectName} on ${date}. Your current attendance is ${percentage}%. Please contact your HOD immediately to avoid attendance shortage.`,
  };

  const parentMail = {
    from: process.env.EMAIL_USER,
    to: student.parentEmail,
    subject: `Attendance Update — ${student.name}`,
    text: `Dear Parent, your ward ${student.name} was absent for ${subjectName} on ${date}. Current attendance: ${percentage}%. Please ensure regular attendance.`,
  };

  const [studentResult, parentResult] = await Promise.allSettled([
    transporter.sendMail(studentMail),
    transporter.sendMail(parentMail),
  ]);

  if (studentResult.status === 'fulfilled') {
    console.log(`✅ Student email sent to ${student.email}`);
  } else {
    console.error(`❌ Student email failed (${student.email}):`, studentResult.reason?.message || studentResult.reason);
  }

  if (parentResult.status === 'fulfilled') {
    console.log(`✅ Parent email sent to ${student.parentEmail}`);
  } else {
    console.error(`❌ Parent email failed (${student.parentEmail}):`, parentResult.reason?.message || parentResult.reason);
  }

  if (studentResult.status === 'rejected' || parentResult.status === 'rejected') {
    throw new Error('One or more emails failed');
  }

  return { student: true, parent: true };
}

module.exports = { sendDualNotification };
