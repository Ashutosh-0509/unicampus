const User = require('./User');
const Attendance = require('./Attendance');
const Notification = require('./Notification');
const Result = require('./Result');
const { HostelRoom, HostelComplaint } = require('./Hostel');
const Book = require('./Book');
const BookIssue = require('./BookIssue');
const Assignment = require('./Assignment');
const Subject = require('./Subject');
const Resource = require('./Resource');
const { PlacementDrive, PlacementApplication } = require('./Placement');
const FinanceRecord = require('./FinanceRecord');
const ChatMessage = require('./ChatMessage');
const Upload = require('./Upload');
const MaintenanceTicket = require('./MaintenanceTicket');
const Feedback = require('./Feedback');
const RecommendationLetter = require('./RecommendationLetter');
const Grade = require('./Grade');
const Event = require('./Event');
const Doubt = require('./Doubt');



// Export all models
module.exports = {
  User,
  Attendance,
  Notification,
  Result,
  HostelRoom,
  HostelComplaint,
  Book,
  BookIssue,
  Assignment,
  Subject,
  Resource,
  PlacementDrive,
  PlacementApplication,
  FinanceRecord,
  ChatMessage,
  Upload,
  MaintenanceTicket,
  Feedback,
  RecommendationLetter,
  Grade,
  Event,
  Doubt,


};
