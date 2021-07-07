import {
  Box,
  colors,
  makeStyles,
  Typography,
  useTheme,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import { getTimeHour } from "../../../tools/time";
import useWindowDimensions from "../../../tools/useWindowDimensions";
import { getCourseManager } from "../../../controllers/CourseManager";
import Chip from "@material-ui/core/Chip";
import { getRandomColor } from "../../../tools/colors";
import TimeCard from "./TimeCard";

const dayNames = {
  normal: ["Online", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  small: ["OL", "Mon", "Tue", "Wed", "Thu", "Fri"],
  xs: ["O", "M", "T", "W", "T", "F"],
};
const useStyle = makeStyles((theme) => ({
  root: {
    width: "20%",
    margin: 0,
    padding: 0,
    marginLeft: 4,
    marginTop: 2,
    [theme.breakpoints.up("sm")]: {
      marginLeft: 8,
    },

    [theme.breakpoints.up("md")]: {
      marginLeft: 16,
    },
    display: "flex",
    flexDirection: "column",
    transition: "margin .3s linear",
  },
  dayNameDiv: {
    height: (props) => props.headerSize,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    [theme.breakpoints.up("md")]: {
      justifyContent: "space-between",
      marginLeft: 8,
      marginRight: 8,
    },
    justifyContent: "center",
  },
  dayName: {
    maxHeight: (props) => props.headerSize,
    height: "fix-content",
    textAlign: "center",
    fontSize: "0.8rem",
    [theme.breakpoints.up("md")]: {
      fontSize: "0.9rem",
    },
  },
  dayTime: {
    height: "fix-content",
    textAlign: "center",
    color: theme.palette.type === "dark" ? "grey" : "grey",
    [theme.breakpoints.up("md")]: {
      display: "inherit",
    },
    display: "none",
    fontSize: "0.8rem",
  },
  activityField: {
    borderRadius: 4,
    border: "1px solid grey",
    borderColor:
      theme.palette.type === "dark"
        ? "rgba(128,128,128,0.8)"
        : "rgba(211,211,211, 0.8)",
    background:
      theme.palette.type === "dark"
        ? "repeating-linear-gradient( 45deg, #0000, #0000 10px, #4445 10px, #4445 13px )"
        : "repeating-linear-gradient( 45deg, #fff0, #fff0 10px, #ccc5 10px, #ccc5 13px )",
    width: "100%",
    flexGrow: 1,
    padding: 0,
    margin: 0,
    marginTop: 4,
    position: "relative",
  },
}));
function TimeColumn(props) {
  const classes = useStyle(props);
  const theme = useTheme();
  const {
    day,
    activities,
    timetableIndex,
    timeRange,
    hourBlockHeightRatio,
    highlightCourse,
    contentWidth,
    setHighlightCourse,
  } = props;

  const shorterNames = contentWidth < 1540;
  const dayName = shorterNames ? dayNames.small[day] : dayNames.normal[day];

  let hours = 0;
  let nextHour = timeRange[0];
  let preConflict = [];
  const cardIdList = {};
  const hintSpace = [];
  const conflictQ = [];
  const seTimeTable = {};
  const courseCardProps = (activities || []).map((activity, index) => {
    let courseName = activity.courseName;
    let type = activity.meetingType;
    let sTime = activity.meetingStartTime;
    let eTime = activity.meetingEndTime;
    sTime = getTimeHour(sTime);
    eTime = getTimeHour(eTime);
    if (sTime > nextHour) {
      nextHour = sTime;
      hintSpace.push();
    }
    if (eTime > nextHour) hours += eTime - nextHour;
    nextHour = sTime;

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

    // generate cards
    const highlightMe = highlightCourse === courseName;
    const highlightOther = highlightCourse && !highlightMe;
    return {
      key: idKey,
      adjust: {},
      conflictLevel: conflictLevel,
      activity: activity,
      timeTop: sTime - timeRange[0],
      timeHeight: eTime - sTime,
      hourBlockHeightRatio: hourBlockHeightRatio,
      highlightMe: highlightMe,
      highlightOther: highlightOther,
      timetableIndex: timetableIndex,
      contentWidth: contentWidth,
      onMouseEnter: () => setHighlightCourse(courseName),
      onMouseLeave: () => setHighlightCourse(false),
    };
  });

  // conflict handling
  const conflictPadding = contentWidth > 1200 ? 12 : contentWidth > 600 ? 8 : 4; // 2% shift
  // check for type A conflict (two or more section has the same sTime and eTime)
  for (const seTime in seTimeTable) {
    if (seTime && seTimeTable[seTime].length >= 2) {
      const leftShift =
        courseCardProps[seTimeTable[seTime][0]].conflictLevel * conflictPadding;
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

  // check for type B conflict (two or more section has the same sTime and eTime)

  const courseCards = (courseCardProps || []).map((courseCardProp) => {
    return (
      <TimeCard
        key={courseCardProp.key}
        adjust={courseCardProp.adjust}
        activity={courseCardProp.activity}
        timeTop={courseCardProp.timeTop}
        timeHeight={courseCardProp.timeHeight}
        hourBlockHeightRatio={courseCardProp.hourBlockHeightRatio}
        highlightMe={courseCardProp.highlightMe}
        highlightOther={courseCardProp.highlightOther}
        timetableIndex={courseCardProp.timetableIndex}
        contentWidth={courseCardProp.contentWidth}
        onMouseEnter={courseCardProp.onMouseEnter}
        onMouseLeave={courseCardProp.onMouseLeave}
      />
    );
  });

  return (
    <Box className={classes.root}>
      <div className={classes.dayNameDiv}>
        <Typography className={classes.dayName}>{dayName}</Typography>
        <Typography className={classes.dayTime}>
          {parseInt(hours)} hrs
        </Typography>
      </div>
      <div className={classes.activityField}>
        {hintSpace}
        {courseCards}
      </div>
    </Box>
  );
}

export default TimeColumn;
