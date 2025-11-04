const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Timetable = require('../models/Timetable');
const Period = require('../models/Period');
const Semester = require('../models/Semester');

async function generatePeriods() {
  try {
    console.log('📅 Generating periods from timetable...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sams');
    console.log('✅ Connected to MongoDB');

    // Get current semester
    const currentSemester = await Semester.findOne({ isCurrent: true });
    if (!currentSemester) {
      console.log('❌ No current semester found. Please create a current semester first.');
      return;
    }
    console.log(`✅ Found current semester: ${currentSemester.name}`);

    // Get all timetable entries for the current semester
    const timetableEntries = await Timetable.find({ semester: currentSemester._id })
      .populate('subject teacher semester program department');

    if (timetableEntries.length === 0) {
      console.log('❌ No timetable entries found for current semester.');
      return;
    }
    console.log(`✅ Found ${timetableEntries.length} timetable entries`);

    // Clear existing periods for current semester
    await Period.deleteMany({ semester: currentSemester._id });
    console.log('✅ Cleared existing periods');

    // Generate periods for the next 7 days
    const today = new Date();
    const generatedPeriods = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue;
      }

      for (const timetable of timetableEntries) {
        // Only create periods for matching day of week
        if (timetable.dayOfWeek === currentDate.getDay()) {
          // Parse start and end times
          const [startHour, startMinute] = timetable.startTime.split(':').map(Number);
          const [endHour, endMinute] = timetable.endTime.split(':').map(Number);

          const startTime = new Date(currentDate);
          startTime.setHours(startHour, startMinute, 0, 0);

          const endTime = new Date(currentDate);
          endTime.setHours(endHour, endMinute, 0, 0);

          // Only create periods for future times
          if (startTime > new Date()) {
            const period = new Period({
              subject: timetable.subject._id,
              teacher: timetable.teacher._id,
              room: timetable.room,
              startTime,
              endTime,
              date: currentDate,
              dayOfWeek: currentDate.getDay(),
              timetable: timetable._id,
              semester: currentSemester._id,
              program: timetable.program._id,
              department: timetable.department._id,
              location: timetable.location,
              geofenceRadius: timetable.geofenceRadius,
              status: 'scheduled'
            });

            generatedPeriods.push(period);
          }
        }
      }
    }

    // Save all generated periods
    if (generatedPeriods.length > 0) {
      await Period.insertMany(generatedPeriods);
      console.log(`✅ Generated ${generatedPeriods.length} periods for the next 7 days`);

      // Show upcoming periods
      const upcomingPeriods = await Period.find({
        semester: currentSemester._id,
        startTime: { $gt: new Date() }
      })
      .populate('subject teacher room')
      .sort({ startTime: 1 })
      .limit(5);

      console.log('\n📋 Upcoming Periods:');
      upcomingPeriods.forEach((period, index) => {
        console.log(`   ${index + 1}. ${period.subject.name} - ${period.teacher.firstName} ${period.teacher.lastName}`);
        console.log(`      Date: ${period.startTime.toLocaleDateString()}`);
        console.log(`      Time: ${period.startTime.toLocaleTimeString()} - ${period.endTime.toLocaleTimeString()}`);
        console.log(`      Room: ${period.room}`);
        console.log('');
      });
    } else {
      console.log('ℹ️  No periods generated for the next 7 days (all periods might be in the past)');
    }

    console.log('🎉 Period generation completed successfully!');

  } catch (error) {
    console.error('❌ Error generating periods:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the generation function
if (require.main === module) {
  generatePeriods();
}

module.exports = generatePeriods;