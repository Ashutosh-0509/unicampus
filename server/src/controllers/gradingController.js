const { Result, User } = require('../models');

function toLetterGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 45) return 'D';
  return 'F';
}

// @desc    Save/Update grades for a subject
// @route   POST /api/grading/save
// @access  Private (Faculty/Admin)
const saveGrades = async (req, res) => {
  try {
    const { subjectCode, grades = [] } = req.body;

    if (!subjectCode || !Array.isArray(grades)) {
      return res.status(400).json({ error: 'subjectCode and grades are required' });
    }

    const invalid = grades.find((g) => Number(g.marks) > Number(g.maxMarks));
    if (invalid) {
      return res.status(400).json({ error: `marks cannot exceed maxMarks for student ${invalid.studentId}` });
    }

    const operations = grades.map((grade) =>
      Result.findOneAndUpdate(
        {
          studentId: grade.studentId,
          subjectCode,
          examType: grade.examType,
        },
        {
          $set: {
            studentId: grade.studentId,
            subjectCode,
            marks: Number(grade.marks),
            maxMarks: Number(grade.maxMarks),
            examType: grade.examType,
            grade: toLetterGrade((Number(grade.marks) / Number(grade.maxMarks)) * 100),
          },
        },
        { new: true, upsert: true }
      )
    );

    await Promise.all(operations);

    res.json({ success: true, savedCount: grades.length });
  } catch (error) {
    console.error('Save Grades Error:', error);
    res.status(500).json({ error: 'Failed to save grades' });
  }
};

// @desc    Export grades to CSV
// @route   GET /api/grading/export
// @access  Private (Faculty/Admin)
const exportGradesCSV = async (req, res) => {
  try {
    const { subjectCode, examType } = req.query;
    if (!subjectCode || !examType) {
      return res.status(400).json({ error: 'subjectCode and examType are required' });
    }

    const grades = await Result.find({ subjectCode, examType }).lean();

    const rows = await Promise.all(
      grades.map(async (grade) => {
        const student = await User.findOne({
          $or: [{ id: grade.studentId }, { studentId: grade.studentId }, { rollNumber: grade.studentId }]
        }).lean();

        const marks = Number(grade.marks || 0);
        const maxMarks = Number(grade.maxMarks || 0);
        const percentageValue = maxMarks > 0 ? Number(((marks / maxMarks) * 100).toFixed(1)) : 0;
        const letterGrade = toLetterGrade(percentageValue);

        return [
          student?.rollNumber || student?.studentId || grade.studentId,
          student?.name || 'Unknown Student',
          marks,
          maxMarks,
          `${percentageValue}%`,
          letterGrade,
        ];
      })
    );

    const header = 'Roll Number,Student Name,Marks,Max Marks,Percentage,Grade';
    const csvBody = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(',')).join('\n');
    const csv = `${header}\n${csvBody}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="grades_${subjectCode}_${examType}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export CSV Error:', error);
    res.status(500).json({ error: 'Failed to export grades CSV' });
  }
};

module.exports = {
  saveGrades,
  exportGradesCSV,
};
