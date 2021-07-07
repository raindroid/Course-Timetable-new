import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CourseModel } from "../models/CourseModel";
import { getTimeHour } from "../tools/time";
import { CourseController } from "./CourseController";
import { getCourseManager } from "./CourseManager";
import { courseFilterQuery, courseKeywordQuery } from "./queries";

require("dotenv").config();

class TimeManager {
  constructor(timetableIndex) {
    this.timetableIndex = timetableIndex;
  }

  getRawTimetable() {
    return getCourseManager().getTimetable(this.timetableIndex);
  }

  getTimeRange() {
    const timetable = this.getRawTimetable();
    const timeRange = (timetable && timetable.timeRange) || [9, 22];
    return timeRange;
  }

  getSelectedTerms() {
    
    return getCourseManager().getTerms(this.timetableIndex);
  }
}

export default TimeManager;
