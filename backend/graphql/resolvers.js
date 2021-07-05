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

      console.log(courseName, courseTitle);

      const searchList = [];
      if (courseName)
        searchList.push({
          courseName: { $regex: new RegExp(courseName, "i") },
        });
      if (courseTitle)
        searchList.push({
          courseTitle: { $regex: new RegExp(courseTitle, "i") },
        });
      if (courseType)
        searchList.push({
          courseType: { $regex: new RegExp(courseType, "i") },
        });
      if (courseDescription)
        searchList.push({
          courseDescription: { $regex: new RegExp(courseDescription, "i") },
        });
      if (courseBreadthRequirements)
        searchList.push({
          courseBreadthRequirements: {
            $regex: new RegExp(courseBreadthRequirements, "i"),
          },
        });
      if (courseProgramTags)
        searchList.push({
          courseProgramTags: { $regex: new RegExp(courseProgramTags, "i") },
        });

      let courseList = [];
      if (searchList.length === 0) courseList = await Course.find();
      else
        courseList = await Course.find({
          $and: searchList,
        }).sort("courseName");

      // console.log(courseList[0]["meetings"][0]);

      return sliceCourseList(courseList, sectionLength, sectionId);
    },
    getCoursesByKeyword: async (_, { keyword, sectionLength, sectionId }) => {
      keyword = sanitize(keyword);
      sectionLength = sectionLength || 20;
      sectionId = sectionId || 0;
      if (sectionId < 0)
        return { error: "Invalid sectionId value (too small)" };
      if (sectionLength >= 200 || sectionLength <= 0)
        return { error: "Invalid sectionLength value (overrange)" };

      const courseList = await Course.find({
        $or: [
          { courseName: { $regex: new RegExp(keyword, "i") } },
          { courseTitle: { $regex: new RegExp(keyword, "i") } },
          { courseType: { $regex: new RegExp(keyword, "i") } },
          { courseDescription: { $regex: new RegExp(keyword, "i") } },
          { courseBreadthRequirements: { $regex: new RegExp(keyword, "i") } },
          { courseProgramTags: { $regex: new RegExp(keyword, "i") } },
        ],
      }).sort("courseName");

      // console.log(courseList[0]["meetings"][0]);

      return sliceCourseList(courseList, sectionLength, sectionId);
    },
  },
};

module.exports = resolvers;
