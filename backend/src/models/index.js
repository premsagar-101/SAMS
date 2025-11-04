const { User } = require('./User');
const { Department } = require('./Department');
const { Program } = require('./Program');
const { Semester } = require('./Semester');
const { Subject } = require('./Subject');
const { StudentEnrollment } = require('./StudentEnrollment');
const { Timetable } = require('./Timetable');
const { Period } = require('./Period');
const { Attendance } = require('./Attendance');
const { QRSession } = require('./QRSession');
const { Notification } = require('./Notification');
const { SystemConfig } = require('./SystemConfig');

module.exports = {
  User,
  Department,
  Program,
  Semester,
  Subject,
  StudentEnrollment,
  Timetable,
  Period,
  Attendance,
  QRSession,
  Notification,
  SystemConfig
};