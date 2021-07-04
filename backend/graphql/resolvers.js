const Course = require("../models/Course.model");
const sanitize = require("mongo-sanitize");

const sliceCourseList = (courseList, sectionLength, sectionId) => {
  const totalLength = courseList.length;
  const totalSections = Math.floor(totalLength / sectionLength);
  if (sectionId > 0 && sectionId >= totalSections)
    return { error: "Invalid sectionId value (too large)" };
  const resultsList = courseList.slice(
    sectionId * sectionLength,
    (sectionId + 1) * sectionLength
  );
  return {
    courses: resultsList,
    resultLength: resultsList.length,
    totalLength,
    totalSections,
    sectionLength,
    sectionId,
  };
};

const resolvers = {
  Query: {
    hello: () => {
      return "Hello world";
    },
    getAllCourses: async () => {
      return await Course.find();
    },
    getCourse: async (_, { id }) => {
      id = sanitize(id);
      return await Course.findById(id);
    },
    getCoursesByFilters: async (
      _,
      {
        courseName,
        courseTitle,
        courseType,
        courseDescription,
        courseBreadthRequirements,
        courseProgramTags,
        sectionLength,
        sectionId,
      }
    ) => {
      courseName = sanitize(courseName);
      courseTitle = sanitize(courseTitle);
      courseType = sanitize(courseType);
      courseDescription = sanitize(courseDescription);
      courseBreadthRequirements = sanitize(courseBreadthRequirements);
      courseProgramTags = sanitize(courseProgramTags);
      sectionLength = sectionLength || 20;
      sectionId = sectionId || 0;
      if (sectionId < 0)
        return { error: "Invalid sectionId value (too small)" };
      if (sectionLength >= 200 || sectionLength <= 0)
        return { error: "Invalid sectionLength value (overrange)" };

      const courseList = await Course.find({
        courseName: { $regex: new RegExp(courseName, "i") },
      }).sort("courseName");

      console.log(courseList[0]['meetings'][0])

      return sliceCourseList(courseList, sectionLength, sectionId);
    },
    getCoursesByKeyword: async (_, { keyword }) => {
      keyword = sanitize(keyword);
      return {};
    },
  },
};

module.exports = resolvers;
