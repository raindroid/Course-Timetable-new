const { gql } = require("apollo-server-express");
const typeDefs = gql`
  type ActivityDetail {
    meetingDay: Int
    meetingStartDate: String
    meetingStartTime: String
    meetingEndTime: String
    meetingLocation: String
    instructor: String
    note: String
  }
  type Activity {
    meetingName: String
    instructor: [String]
    deliveryMode: String
    detail: [ActivityDetail]
  }
  type Meeting {
    meetingType: String
    activities: [Activity]
  }
  type Course {
    id: ID!
    courseName: String!
    courseTitle: String!
    courseShortName: String
    courseType: String
    courseDescription: String
    courseUrl: String
    orgName: String

    courseAUs: String
    courseCorequisite: String
    courseCredit: String
    courseExclusion: String
    courseHours: String
    courseProgramTags: String
    courseRecommendedPreparation: String
    courseDistributionRequirements: String
    courseBreadthRequirements: String

    meetings: [Meeting]
  }
  type CourseResultList {
    courses: [Course]
    totalLength: Int
    totalSections: Int
    sectionLength: Int
    resultLength: Int
    sectionId: Int
    error: String
  }
  type Query {
    hello: String
    getAllCourses: [Course]
    getCourse(id: ID): Course
    getCoursesByFilters(
      courseName: String
      courseTitle: String
      courseType: String
      courseDescription: String
      courseBreadthRequirements: String
      courseProgramTags: String
      sectionLength: Int
      sectionId: Int
    ): CourseResultList
    getCoursesByKeyword(
      keyword: String!
      sectionLength: Int
      sectionId: Int
    ): CourseResultList
  }
`;

module.exports = typeDefs;
