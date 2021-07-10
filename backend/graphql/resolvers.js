const Course = require("../models/Course.model");
const sanitize = require("mongo-sanitize");
const Timetable = require("../models/Timetable.model");
const { v4: uuidv4 } = require("uuid");

const sliceCourseList = (courseList, sectionLength, sectionId, logName) => {
  const totalLength = courseList.length;
  const totalSections = Math.floor(totalLength / sectionLength);
  console.log(`[${logName || "Log"}] Total ${totalLength} results, finding section ${sectionId}`);
  if (sectionId > 0 && sectionId >= totalSections)
    return { error: "Invalid sectionId value (too large)" };
  const resultsList = courseList.slice(
    sectionId * sectionLength,
    (sectionId + 1) * sectionLength
  );
  console.log(`[${logName || "Log"}] Return ${resultsList.length} results`);
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
      if (sectionLength >= 2000 || sectionLength <= 0)
        return { error: "Invalid sectionLength value (overrange)" };

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

      return sliceCourseList(courseList, sectionLength, sectionId, "getCoursesByFilters");
    },
    getCoursesByKeyword: async (_, { keyword, sectionLength, sectionId }) => {
      keyword = sanitize(keyword);
      sectionLength = sectionLength || 20;
      sectionId = sectionId || 0;

      console.log(`[getCoursesByKeyword] Received getCoursesByKeyword request {keyword: ${keyword}}`);

      if (sectionId < 0)
        return { error: "Invalid sectionId value (too small)" };
      if (sectionLength >= 2000 || sectionLength <= 0)
        return { error: "Invalid sectionLength value (overrange)" };

      const courseList = await Course.find({
        $or: [
          { courseName: { $regex: new RegExp(keyword, "i") } },
          { courseTitle: { $regex: new RegExp(keyword, "i") } },
          { courseType: { $regex: new RegExp(keyword, "i") } },
          { courseDescription: { $regex: new RegExp(keyword, "i") } },
          { courseBreadthRequirements: { $regex: new RegExp(keyword, "i") } },
          { courseProgramTags: { $regex: new RegExp(keyword, "i") } },
          { courseCorequisite: { $regex: new RegExp(keyword, "i") } },
          { courseExclusion: { $regex: new RegExp(keyword, "i") } },
          {
            courseRecommendedPreparation: { $regex: new RegExp(keyword, "i") },
          },
          { coursePrerequisite: { $regex: new RegExp(keyword, "i") } },
        ],
      }).sort("courseName");

      // console.log(courseList[0]["meetings"][0]);

      return sliceCourseList(courseList, sectionLength, sectionId, "getCoursesByKeyword");
    },
    getTimetable: async (_, { id }) => {
      id = sanitize(id) || "";
      const res = await Timetable.find({
        tId: id,
        session: "2021_2022-FallWinter",
        school: "UT",
      });
      console.log(
        `[getTimetable] Looked for timetable ${id}, res is ${res && res.length}`
      );
      return res && res.length > 0 && res[0].timetable;
    },
  },
  Mutation: {
    saveTimetable: async (_, { timetable }) => {
      // check for duplicates
      const preRes = await Timetable.find({
        timetable,
        session: "2021_2022-FallWinter",
        school: "UT",
      });

      if (preRes && preRes.length > 0) {
        const tId = preRes[0].tId;
        console.log(
          `[saveTimetable] Found duplicate copies for timetable ${tId}, res is ${
            preRes && preRes.length
          }`
        );
        return tId;
      } else {
        let tId = "";
        do {
          let uuId = uuidv4();
          // remove decoration
          uuId = uuId.replace("-", "");

          tId = Buffer.from(uuId, "hex").toString("base64");
        } while (tId.indexOf("/") !== -1);

        const timetableEntry = new Timetable({
          timetable,
          tId,
          session: "2021_2022-FallWinter",
          school: "UT",
        });
        const res = await timetableEntry.save();

        console.log(
          `[saveTimetable] Saved for timetable ${tId}, res is ${res && res.length}`
        );

        // Log purpose
        const allRes = await Timetable.find({
          session: "2021_2022-FallWinter",
          school: "UT",
        });
        console.log(`[saveTimetable] Currently saved ${allRes ? allRes.length : 0} timetables`)

        return tId;
      }
    },
  },
};

module.exports = resolvers;
