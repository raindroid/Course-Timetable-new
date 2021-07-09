import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CourseModel } from "../models/CourseModel";
import { getTimeHour } from "../tools/time";
import { CourseController } from "./CourseController";
import { getCourseManager } from "./CourseManager";
import { courseFilterQuery, courseKeywordQuery } from "./queries";

require("dotenv").config();

const timeCache = {};

class TimeManager {
  constructor(timetableIndex) {
    this.timetableIndex = timetableIndex;
    this.cacheProps = timeCache; // to avoid recalculate everything when redrowing
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

  calculateColumnCardProps(timeRange, activities, contentWidth) {
    let hours = 0;
    let nextHour = timeRange[0];
    let preConflict = [];
    let gapHour = timeRange[0];
    const cardIdList = {};
    const conflictQ = [];
    const hintSpace = [];
    const seTimeTable = {};
    const courseCardProps = (activities || []).map((activity, index) => {
      let courseName = activity.courseName;
      let type = activity.meetingType;
      let sTime = activity.meetingStartTime;
      let eTime = activity.meetingEndTime;
      let controller = getCourseManager().getCourseContronller(
        this.timetableIndex,
        courseName
      );
      let disabled = controller.getDisabled();

      sTime = getTimeHour(sTime);
      eTime = getTimeHour(eTime);
      if (sTime > nextHour) {
        nextHour = sTime;
      }
      if (eTime > nextHour) hours += eTime - nextHour;
      nextHour = sTime;

      // calculate for gap information
      if (sTime > gapHour) {
        hintSpace.push({
          sTime: gapHour,
          eTime: sTime,
          first: gapHour === timeRange[0],
          last: false
        });
      }
      gapHour = eTime;

      // conflict detection
      let conflictLevel = 0;
      const seKey = `${sTime}-${eTime}`;
      if (seTimeTable[seKey]) {
        seTimeTable[seKey].push(index);
      } else {
        seTimeTable[seKey] = [index];
        while (
          conflictQ[conflictLevel] &&
          conflictQ[conflictLevel].eTime > nextHour
        ) {
          conflictLevel += 1;
          if (conflictLevel === conflictQ.length) conflictQ.push(false);
        }
        if (conflictLevel > 0) preConflict.push(conflictQ[0].index);
        conflictQ[conflictLevel] = { sTime, eTime, index };
      }

      //generate new and reuseable key
      let idKey = `${courseName}-${type}`;
      cardIdList[idKey] = (cardIdList[idKey] || 0) + 1;
      idKey = `${idKey}-${cardIdList[idKey]}`;

      return {
        key: idKey,
        adjust: {},
        courseName: courseName,
        conflictLevel: conflictLevel,
        activity: activity,
        timeTop: sTime - timeRange[0],
        timeHeight: eTime - sTime,
        disabled: disabled,
      };
    });

    // provide last hint tag
    if (timeRange[1] > gapHour)
      hintSpace.push({
        sTime: gapHour,
        eTime: timeRange[1],
        first: false,
        last: true
      });

    // conflict handling
    const conflictPadding =
      contentWidth > 1200 ? 12 : contentWidth > 600 ? 8 : 4; // 2% shift
    // check for type A conflict (two or more section has the same sTime and eTime)
    for (const seTime in seTimeTable) {
      if (seTime && seTimeTable[seTime].length >= 2) {
        const leftShift =
          courseCardProps[seTimeTable[seTime][0]].conflictLevel *
          conflictPadding;
        const rightShift = preConflict.includes(seTimeTable[seTime][0])
          ? conflictPadding
          : 0;
        preConflict = preConflict.filter((pc) => pc !== seTimeTable[seTime][0]);
        let timeIndex = 0;
        for (const cardIndex of seTimeTable[seTime]) {
          const first = cardIndex === 0;
          const last = cardIndex === seTimeTable[seTime].length - 1;
          courseCardProps[cardIndex].adjust = {
            left: `${
              leftShift +
              (((100 - leftShift - rightShift) * timeIndex) /
                seTimeTable[seTime].length +
                (!first ? 0.6 : 0))
            }%`,
            right: `${
              100 -
              leftShift -
              ((100 - leftShift - rightShift) * (1 + timeIndex)) /
                seTimeTable[seTime].length +
              (!last ? 0.6 : 0)
            }%`,
          };
          timeIndex += 1;
        }
      }
    }

    // check for type B conflict (overlap - bounding box)
    for (const pc of preConflict) {
      courseCardProps[pc].adjust = { right: conflictPadding };
    }
    for (let courseCardProp of courseCardProps) {
      if (courseCardProp.conflictLevel > 0) {
        courseCardProp.adjust = {
          left: conflictPadding * courseCardProp.conflictLevel,
        };
      }
    }

    return { hours, hintSpace, courseCardProps };
  }

  hashString(str) {
    var hash = 0;
    if (str.length === 0) {
      return hash;
    }
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  getColumnCardProps(day, timeRange, activities, contentWidth, termName) {
    if (getCourseManager().timeRecalculateNeeded) {
      for (const prop in this.cacheProps) {
        delete this.cacheProps[prop];
      }
      getCourseManager().timeRecalculateNeeded = false;
    }
    const hash =
      this.hashString(
        JSON.stringify(getCourseManager().getTimetable(this.timetableIndex))
      ) +
      this.hashString(contentWidth) +
      this.hashString(`${timeRange[0]}~${timeRange[1]}`) +
      this.hashString(termName);

    const cache = this.cacheProps[termName] && this.cacheProps[termName][day];
    if (!cache || cache.hash !== hash) {
      if (!this.cacheProps[termName]) this.cacheProps[termName] = {};
      this.cacheProps[termName][day] = {
        hash,
        data: this.calculateColumnCardProps(
          timeRange,
          activities,
          contentWidth
        ),
      };
    }
    return this.cacheProps[termName][day].data;
  }
}

export default TimeManager;
