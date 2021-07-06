const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      reuiqres: true,
    },
    courseTitle: {
      type: String,
      reuiqres: true,
    },

    courseShortName: String,
    courseType: String,
    courseDescription: String,
    courseUrl: String,
    orgName: String,

    courseAUs: String,
    courseCorequisite: String,
    courseCredit: String,
    courseExclusion: String,
    courseHours: String,
    coursePrerequisite: String,
    courseProgramTags: String,
    courseRecommendedPreparation: String,
    courseDistributionRequirements: String,
    courseBreadthRequirements: String,

    meetings: [
      {
        meetingType: String,
        activities: [
          {
            meetingName: String,
            instructor: [{ String }],
            deliveryMode: String,
            detail: [
              {
                meetingDay: Number,
                meetingStartDate: String,
                meetingStartTime: String,
                meetingEndTime: String,
                meetingLocation: String,
                instructor: String,
                note: String,
              },
            ],
          },
        ],
      },
    ],
  },
  { collection: "UT_2021_2022-FallWinter" }
);

const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;
