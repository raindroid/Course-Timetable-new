import { gql } from "@apollo/client";

const courseKeywordQuery = gql`
  query Course($keyword: String!, $sectionId: Int, $sectionLength: Int) {
    getCoursesByKeyword(
      keyword: $keyword
      sectionId: $sectionId
      sectionLength: $sectionLength
    ) {
      courses {
        courseName
        courseTitle
        courseShortName
        courseType
        courseDescription
        courseUrl
        orgName

        courseAUs
        courseCorequisite
        courseCredit
        courseExclusion
        courseHours
        coursePrerequisite
        courseProgramTags
        courseRecommendedPreparation
        courseDistributionRequirements
        courseBreadthRequirements

        meetings {
          meetingType
          activities {
            meetingName
            deliveryMode
            instructor
            detail {
              meetingDay
              meetingStartDate
              meetingStartTime
              meetingEndTime
              meetingLocation
              instructor
              note
            }
          }
        }
      }
      totalLength
      resultLength
      error
    }
  }
`;

const courseFilterQuery = gql`
  query Course(
    $courseName: String
    $courseTitle: String
    $courseType: String
    $courseDescription: String
    $courseBreadthRequirements: String
    $courseProgramTags: String
    $sectionId: Int
    $sectionLength: Int
  ) {
    getCoursesByFilters(
      courseName: $courseName
      courseTitle: $courseTitle
      courseType: $courseType
      courseDescription: $courseDescription
      courseBreadthRequirements: $courseBreadthRequirements
      courseProgramTags: $courseProgramTags
      sectionId: $sectionId
      sectionLength: $sectionLength
    ) {
      courses {
        courseName
        courseTitle
        courseShortName
        courseType
        courseDescription
        courseUrl
        orgName

        courseAUs
        courseCorequisite
        courseCredit
        courseExclusion
        courseHours
        coursePrerequisite
        courseProgramTags
        courseRecommendedPreparation
        courseDistributionRequirements
        courseBreadthRequirements

        meetings {
          meetingType
          activities {
            meetingName
            deliveryMode
            instructor
            detail {
              meetingDay
              meetingStartDate
              meetingStartTime
              meetingEndTime
              meetingLocation
              instructor
              note
            }
          }
        }
      }
      totalLength
      resultLength
      error
    }
  }
`;

const courseKeywordListQuery = gql`
  query Course($keyword: String!, $sectionId: Int, $sectionLength: Int) {
    getCoursesByKeyword(
      keyword: $keyword
      sectionId: $sectionId
      sectionLength: $sectionLength
    ) {
      courses {
        courseName
        courseTitle
        courseShortName
        courseType
        courseUrl
        orgName
      }
      totalLength
      resultLength
      error
    }
  }
`;

const courseFilterListQuery = gql`
  query Course(
    $courseName: String
    $courseTitle: String
    $courseType: String
    $courseDescription: String
    $courseBreadthRequirements: String
    $courseProgramTags: String
    $sectionId: Int
    $sectionLength: Int
  ) {
    getCoursesByFilters(
      courseName: $courseName
      courseTitle: $courseTitle
      courseType: $courseType
      courseDescription: $courseDescription
      courseBreadthRequirements: $courseBreadthRequirements
      courseProgramTags: $courseProgramTags
      sectionId: $sectionId
      sectionLength: $sectionLength
    ) {
      courses {
        courseName
        courseTitle
        courseShortName
        courseType
        courseUrl
        orgName
      }
      totalLength
      resultLength
      error
    }
  }
`;

export {
  courseKeywordQuery,
  courseFilterQuery,
  courseKeywordListQuery,
  courseFilterListQuery,
};
