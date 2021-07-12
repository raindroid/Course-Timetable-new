import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CourseModel } from "../models/CourseModel";
import { getTimeHour } from "../tools/time";
import { CourseController } from "./CourseController";
import { courseFilterQuery, courseKeywordQuery } from "./queries";
import { saveTimetableQuery } from "./timetableQueries";

require("dotenv").config();

const getDefaultTimetable = () => {
  return [
    {
      displayName: "Sample table",
      courses: {
        ECE334H1F: {
          color: "#43a2ee",
          selected: {
            LEC: "LEC0101",
            TUT: "TUT0101",
            PRA: "PRA0101",
          },
        },
        ECE470H1F: {
          selected: {
            LEC: "LEC0101",
            TUT: "TUT0102",
            PRA: "PRA0104",
          },
        },
        ECE316H1F: { selected: { LEC: "LEC0101", PRA: "PRA0101" } },
        ECE345H1F: { selected: { LEC: "LEC0101", TUT: "TUT0101" } },
        ENT200H1F: {
          selected: {
            LEC: "LEC9901",
          },
        },
        CIV300H1S: {},
      },
    },
    {
      displayName: "My table",
      courses: {},
    },
  ];
};
class CourseManager {
  constructor() {
    console.log("Loading timetables");
    // try to recover anything we left last time (in the local storage)
    this.timetables = JSON.parse(localStorage.getItem("timetables") || "[]");
    this.timetableTerms = [];
    this.courseControllers = [];
    this.courses = {};

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
    this.timetableTerms = [];
    this.courseControllers = [];
    await Promise.all(
      this.timetables.map(async (timetable, index) => {
        // iterator all timetables
        this.courseControllers.push({ timetableIndex: index, controllers: {} });
        this.timetableTerms.push({ timetableIndex: index, terms: [] });
        for (const courseName in timetable.courses) {
          // iterate all courses, and try to reuse course data
          if (!(await this.addCourse(courseName))) {
            delete timetable.courses[courseName];
            continue;
          }
          if (!timetable.courses[courseName].selected)
            timetable.courses[courseName].selected = {};
          timetable.courses[courseName].termName = this.courses[courseName]
            .termType
            ? this.courses[courseName].termName
            : "";
          this.courseControllers[index].controllers[courseName] =
            new CourseController()
              .bindCourse(this.courses[courseName])
              .bindCourseManager(index);
        }
      })
    );
    // update timerange
    this.timetableUpdateTasks();

    return true;
  }
  saveLocal() {
    const timetableJSON = JSON.stringify(this.timetables) || "";
    localStorage.setItem("timetables", timetableJSON);
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
  getTermNames() {
    return ["Year", "Fall", "Winter"];
  }
  getTerms(timetableIndex) {
    if (
      this.timetables.length === 0 ||
      timetableIndex >= this.timetables.length ||
      !this.timetableTerms[timetableIndex]
    )
      return false;
    return this.timetableTerms[timetableIndex].terms;
  }
  async addTimetableCourse(timetableIndex, courseName) {
    if (!(await this.addCourse(courseName))) return false;
    const timetable = this.getTimetable(timetableIndex);
    timetable.courses[courseName] = {
      selected: {},
      color: this.courses[courseName].color,
    };
    if (!timetable.courses[courseName].selected)
      timetable.courses[courseName].selected = {};
    timetable.courses[courseName].termName = this.courses[courseName].termType
      ? this.courses[courseName].termName
      : "";
    this.courseControllers[timetableIndex].controllers[courseName] =
      new CourseController()
        .bindCourse(this.courses[courseName])
        .bindCourseManager(timetableIndex);

    this.timetableUpdateTasks(timetableIndex);
  }
  removeTimetableCourse(timetableIndex, courseName) {
    // remove course scheduling info
    const courses = this.getTimetable(timetableIndex).courses;
    delete courses[courseName];
    this.timetableUpdateTasks(timetableIndex);

    // force courselist update
    this.forceUpdate();
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
  updateTimeRange(timetableIndex) {
    const timetable = this.getTimetable(timetableIndex);
    if (!timetable) return;
    const minHour = 9;
    const maxHour = 22;

    if (
      !this.courseControllers ||
      !this.courseControllers[timetableIndex].controllers ||
      Object.keys(this.courseControllers[timetableIndex].controllers).length ===
        0
    ) {
      timetable.timeRange = [9, 17];
      return;
    }
    let currentMinHour = maxHour;
    let currentMaxHour = minHour;

    for (const course in timetable.courses) {
      const controller = this.getCourseContronller(timetableIndex, course);
      const courseModel = controller && controller.course;
      const meetings = courseModel && courseModel.meetings;

      if (!meetings) continue;
      for (const meeting of meetings) {
        for (const activity of meeting.activities) {
          if (
            activity &&
            activity.deliveryMode &&
            activity.deliveryMode.toUpperCase() === "In person".toUpperCase() &&
            activity.detail
          ) {
            for (const detail of activity.detail) {
              const startTime = getTimeHour(detail.meetingStartTime);
              const endTime = getTimeHour(detail.meetingEndTime);
              if (startTime && currentMinHour > startTime)
                currentMinHour = startTime;
              if (endTime && currentMaxHour < endTime) currentMaxHour = endTime;
            }
          }
        }
      }
    }
    // expand one more hour for better view
    currentMaxHour = Math.min(currentMaxHour + 1, maxHour);
    currentMinHour = Math.max(currentMinHour - 1, minHour);
    while (currentMaxHour - currentMinHour <= 5) {
      currentMaxHour = Math.min(currentMaxHour + 1, maxHour);
      currentMinHour = Math.max(currentMinHour - 1, minHour);
    }
    timetable.timeRange = [currentMinHour, currentMaxHour];
  }

  updateTerms(timetableIndex) {
    if (!this.timetableTerms || !this.timetableTerms[timetableIndex])
      return false;
    const terms = { Fall: [], Winter: [] };
    let timetable = this.getTimetable(timetableIndex);
    if (!timetable) return {};
    timetable = timetable.courses;

    for (let day = 0; day <= 7; day++) {
      // day 0 is for online async course
      terms.Fall.push([]);
      terms.Winter.push([]);
    }

    for (const course in timetable) {
      const courseModel = this.getCourseContronller(
        timetableIndex,
        course
      ).course;
      for (const selected in timetable[course].selected) {
        const selectedName = timetable[course].selected[selected];
        const selectedActivityList = [];

        // Find the meeting
        let meetingData = courseModel.meetings.filter(
          (m) =>
            m.meetingType &&
            m.meetingType.toUpperCase() === selected.toUpperCase()
        );
        meetingData = meetingData && meetingData.length > 0 && meetingData[0];
        if (!meetingData) continue;

        // Fing the activity
        let activityData = meetingData.activities.filter(
          (a) => a.meetingName === selectedName
        );
        activityData =
          activityData && activityData.length > 0 && activityData[0];
        if (!activityData) continue;

        // check for online async course
        if (
          (!activityData.detail || activityData.detail.length === 0) &&
          (activityData.deliveryMode || "").toLowerCase().indexOf("async") !==
            -1
        ) {
          selectedActivityList.push({
            day: 0,
            activity: {
              courseName: course,
              meetingType: selected,
              meetingName: selectedName,
              deliveryMode: activityData.deliveryMode || "",
              instructor: [],
              meetingLocation: [], // ignoe these two
            },
          });
        }

        // prepare course info
        for (const detail of activityData.detail) {
          // data optimizing
          let instructor = activityData.instructor;
          if (!instructor || instructor.length === 0)
            instructor = detail.instructor || null;
          if (instructor && instructor.toUpperCase() === "NONE")
            instructor = [];
          if (typeof instructor === "string") instructor = [instructor];
          let meetingLocation =
            !detail.meetingLocation || detail.meetingLocation === "NONE"
              ? []
              : detail.meetingLocation;
          if (typeof meetingLocation === "string")
            meetingLocation = [meetingLocation];

          const activity = {
            courseName: course,
            meetingType: selected,
            meetingName: selectedName,
            deliveryMode: activityData.deliveryMode || "",
            ...detail,
            instructor,
            meetingLocation,
          };
          // checck and merge similar meeting
          const preActivity = selectedActivityList.filter(
            (a) =>
              a.day === detail.meetingDay &&
              a.activity.courseName === course &&
              a.activity.meetingName === selectedName &&
              a.activity.meetingStartTime === activity.meetingStartTime &&
              a.activity.meetingEndTime === activity.meetingEndTime
          );
          if (!preActivity || preActivity.length === 0) {
            selectedActivityList.push({
              day: detail.meetingDay,
              activity: activity,
            });
          } else {
            const preInstructor = preActivity[0].activity.instructor;
            preActivity[0].activity.instructor = [
              ...new Set([...preInstructor, ...instructor]),
            ];
            const preMeetingLocation = preActivity[0].activity.meetingLocation;
            preActivity[0].activity.meetingLocation = [
              ...new Set([...preMeetingLocation, ...meetingLocation]),
            ];
          }
        }

        for (const selectedActivity of selectedActivityList) {
          if (terms[timetable[course].termName]) {
            terms[timetable[course].termName][selectedActivity.day].push(
              selectedActivity.activity
            );
          } else if (timetable[course].termName === "Year") {
            terms.Fall[selectedActivity.day].push(selectedActivity.activity);
            terms.Winter[selectedActivity.day].push(selectedActivity.activity);
          }
        }
      }
    }
    // last step, sort each day so we can render faster
    for (const term in terms) {
      for (const activities of terms[term]) {
        activities.sort(
          (actA, actB) =>
            getTimeHour(actA.meetingStartTime) * 100 -
            getTimeHour(actA.meetingEndTime) -
            (getTimeHour(actB.meetingStartTime) * 100 -
              getTimeHour(actB.meetingEndTime))
        );
      }
    }

    this.timetableTerms[timetableIndex].terms = terms;
  }

  timetableUpdateTasks(timetableIndex = null) {
    if (typeof timetableIndex === "number") {
      this.updateTimeRange(timetableIndex);
      this.updateTerms(timetableIndex);
    } else {
      this.timetables.map((timetable, index) => {
        this.updateTimeRange(index);
        this.updateTerms(index);
      });
    }
    this.timeRecalculateNeeded = true;
    this.saveLocal();
  }

  async removeTimetable(timetableIndex) {
    if (typeof timetableIndex === "number") {
      const newTimetable = this.timetables;
      newTimetable.splice(timetableIndex, 1);
      const maxIndex = await this.updateTimetableJSON(
        JSON.stringify(newTimetable)
      );

      if (timetableIndex >= maxIndex) return maxIndex;
      else return timetableIndex;
    }
    return 0;
  }

  async duplicateTimetable(timetableIndex) {
    if (this.timetables[timetableIndex]) {
      const newTimetable = this.timetables;
      const newTable = JSON.parse(
        JSON.stringify(this.timetables[timetableIndex])
      );
      newTable.displayName = newTable.displayName + " copy";
      newTimetable.push(newTable);
      return await this.updateTimetableJSON(JSON.stringify(newTimetable));
    }
    return 0;
  }

  async createTimetable(timetableName = "New Table") {
    const newTimetable = this.timetables;
    const displayName = timetableName || "New Table";
    newTimetable.push({
      displayName,
      courses: {},
    });
    return await this.updateTimetableJSON(JSON.stringify(newTimetable));
  }

  async openSharedTimetable(timetableJSON) {
    const timetable = JSON.parse(timetableJSON);
    if (timetableJSON) {
      const newTimetable = this.timetables;
      timetable.displayName =
        (timetable.displayName || "New table") + " shared";
      newTimetable.push(timetable);
      return await this.updateTimetableJSON(JSON.stringify(newTimetable));
    }
  }

  async updateTimetableJSON(timetableJSON) {
    // clear all old stuff
    this.timetableTerms = [];
    for (const control of this.courseControllers) {
      for (const courseName in control.controllers) {
        control.controllers[courseName].delete(false);
      }
    }
    this.courseControllers = [];

    // update new timetable
    if (!timetableJSON || JSON.parse(timetableJSON).length === 0) {
      this.timetables = [
        {
          displayName: "New table",
          courses: {},
        },
      ];
    } else {
      this.timetables = JSON.parse(timetableJSON);
    }

    this.verified = false;
    await this.verify();

    this.timetableUpdateTasks();
    this.forceUpdate();

    return this.timetables.length - 1;
  }

  async shareTimetable(timetableIndex) {
    if (!this.getTimetable(timetableIndex)) return false;
    const timetableJson = JSON.stringify(this.getTimetable(timetableIndex));

    return this.client
      .mutate({
        mutation: saveTimetableQuery,
        variables: { timetable: timetableJson },
      })
      .then((res) => {
        return res.data && res.data.saveTimetable;
      })
      .catch((res) => console.log(res));
  }
}

const courseManager = new CourseManager();
const getCourseManager = () => {
  return courseManager;
};

export { getCourseManager };
