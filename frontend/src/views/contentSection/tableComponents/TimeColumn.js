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
    timeManager,
    termName,
  } = props;

  const shorterNames = contentWidth < 1540;
  const dayName = shorterNames ? dayNames.small[day] : dayNames.normal[day];

  const { hours, hintSpace, courseCardProps } = timeManager.getColumnCardProps(
    day,
    timeRange,
    activities,
    contentWidth,
    termName
  );

  // check for type B conflict (two or more section has the same sTime and eTime)

  const courseCards = (courseCardProps || []).map((courseCardProp) => {
    // generate cards
    const highlightMe = highlightCourse === courseCardProp.courseName;
    const highlightOther = highlightCourse && !highlightMe;
    return (
      <TimeCard
        key={courseCardProp.key}
        adjust={courseCardProp.adjust}
        activity={courseCardProp.activity}
        timeTop={courseCardProp.timeTop}
        timeHeight={courseCardProp.timeHeight}
        highlightMe={highlightMe}
        highlightOther={highlightOther}
        hourBlockHeightRatio={hourBlockHeightRatio}
        timetableIndex={timetableIndex}
        contentWidth={contentWidth}
        onMouseEnter={() => setHighlightCourse(courseCardProp.courseName)}
        onMouseLeave={() => setHighlightCourse(false)}
      />
    );
  });

  // time hints

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
