import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CourseModel } from "../models/CourseModel";
import { CourseController } from "./CourseController";
import { courseFilterQuery, courseKeywordQuery } from "./queries";

require("dotenv").config();

const getDefaultTimetable = () => {
  return [
    {
      displayName: "2021 F&W",
      courses: {
        ECE344H1F: {
          color: "#43a2ee",
          selected: {
            LEC: "LEC0101",
          },
        },
        ECE361H1F: {},
        ECE311H1F: {},
        ECE334H1F: {},
        ECE345H1F: {},
      },
    },
    {
      displayName: "New table",
      courses: {},
    },
  ];
};
class CourseManager {
  constructor() {
    console.log("Loading timetables");
    // try to recover anything we left last time (in the local storage)
    this.timetables = localStorage.getItem("timetables") || [];
    this.courses = {};
    this.courseControllers = [];

    this.client = new ApolloClient({
      uri: process.env.REACT_APP_GRAPHQL_SERVER,
      cache: new InMemoryCache({ resultCaching: true }),
    });

    this.verified = false;
    this.updater = [];
  }
  async verify() {
    if (this.verified) return;
    this.verified = true;
    if (!this.timetables) this.timetables = getDefaultTimetable();
    await Promise.all(
      this.timetables.map(async (timetable, index) => {
        // iterator all timetables
        this.courseControllers.push({ timetableIndex: index, controllers: {} });
        for (const courseName in timetable.courses) {
          // iterate all courses, and try to reuse course data
          if (!(await this.addCourse(courseName))) {
            delete timetable.courses[courseName];
            continue;
          }
          if (!timetable.courses[courseName].selected)
            timetable.courses[courseName].selected = {};
          this.courseControllers[index].controllers[courseName] =
            new CourseController()
              .bindCourse(this.courses[courseName])
              .bindCourseManager(index);
        }
      })
    );
    return true;
  }
  async addCourse(courseName) {
    if (!this.courses[courseName]) {
      const courses =
        this.courses[courseName] ||
        (await this.queryCourse({
          courseName: courseName,
        }));
      const course = (courses && courses[0]) || false;
      if (!course || Object.keys(course).length === 0) {
        return false;
      }
      this.courses[courseName] = new CourseModel(course);
    }
    return this.courses[courseName];
  }
  addUpdater(counter) {
    this.updater.push(counter);
  }

  removeUpdater(counter) {
    this.updater = this.updater.filter((c) => c !== counter);
  }
  forceUpdate() {
    for (const updater of this.updater) {
      updater();
    }
  }
  getTimetable(index) {
    if (this.timetables.length === 0) this.timetables = getDefaultTimetable();
    if (index >= this.timetables.length) return this.timetables[0];
    return this.timetables[index];
  }
  getCourseContronller(timetableIndex, courseName) {
    if (
      this.timetables.length === 0 ||
      timetableIndex >= this.timetables.length
    )
      return false;
    return this.courseControllers[timetableIndex].controllers[courseName];
  }
  async addTimetableCourse(timetableIndex, courseName) {
    if (!(await this.addCourse(courseName))) return false;
    this.getTimetable(timetableIndex).courses[courseName] = {
      selected: {},
      color: this.courses[courseName].color
    };
    this.courseControllers[timetableIndex].controllers[courseName] =
      new CourseController()
        .bindCourse(this.courses[courseName])
        .bindCourseManager(timetableIndex);
    console.log(this.timetables);
    console.log(this.courseControllers);
  }
  async queryCourse({
    courseName,
    courseTitle,
    courseType,
    courseDescription,
    courseBreadthRequirements,
    courseProgramTags,
    sectionId,
    sectionLength,
  }) {
    return this.client
      .query({
        query: courseFilterQuery,
        variables: {
          courseName,
          courseTitle,
          courseType,
          courseDescription,
          courseBreadthRequirements,
          courseProgramTags,
          sectionId,
          sectionLength,
        },
      })
      .then((res) => {
        return (
          (res.data.getCoursesByFilters &&
            res.data.getCoursesByFilters.courses) ||
          []
        );
      })
      .catch((res) => console.log(res));
  }
  async queryCourseByKeyword({ keyword, sectionId, sectionLength }) {
    if (!keyword) return [];
    return this.client
      .query({
        query: courseKeywordQuery,
        variables: {
          keyword,
          sectionId,
          sectionLength,
        },
      })
      .then((res) => {
        return (
          (res.data.getCoursesByFilters &&
            res.data.getCoursesByFilters.courses) ||
          []
        );
      })
      .catch((res) => console.log(res));
  }
}

const courseManager = new CourseManager();
const getCourseManager = () => {
  return courseManager;
};

export { getCourseManager };
