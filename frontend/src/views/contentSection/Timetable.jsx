import { Box, Chip, Grid, makeStyles, useTheme } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { getCourseManager } from "../../controllers/CourseManager";
import TimeManager from "../../controllers/TimeManager";
import { useForceUpdate } from "../../tools/useForceUpdate";
import TimeColumn from "./tableComponents/TimeColumn";
import TimeLabel from "./tableComponents/TimeLabel";

const useStyle = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "auto",
    display: "flex",
    flexDirection: "column",
    paddingRight: 4,
    margin: 0,
  },
  base: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyItems: "flex-start",
    padding: 0,
    margin: 0,
  },
  columnBox: {
    width: "100%",
    margin: 0,
    padding: 0,
  },
  onlineAsyncList: {
    padding: 4,
    paddingLeft: 16,
  },
  onlinAsyncTitle: {
    display: "inline-block",
    fontWeight: "bold",
  },
  onlineAsyncChip: {
    margin: 0,
    marginLeft: 4,
    padding: "0 2px 0 2px",
    transition: "all 0.15s ease-in-out",
  },
}));

function Timetable(props) {
  const classes = useStyle(props);
  const theme = useTheme();
  const { timetableIndex, timeManager, termName, activities } = props;
  const { highlightCourse, contentWidth, setHighlightCourse } = props;
  const [headerSize, setHeaderSize] = useState(32);
  const [hourBlockHeightRatio, setHourBlockHeightRatio] = useState(1);
  const timeRange = timeManager ? timeManager.getTimeRange() : [9, 22];
  const onlineActivities = activities[0] || [];

  const elementWidth = contentWidth - 4

  const timeColumns = [];
  for (let i = 0; i < 5; i++) {
    timeColumns.push(
      <TimeColumn
        day={i + 1}
        key={i}
        termName={termName}
        timeManager={timeManager}
        headerSize={headerSize}
        activities={activities && activities[i + 1]}
        timetableIndex={timetableIndex}
        timeRange={timeRange}
        hourBlockHeightRatio={hourBlockHeightRatio}
        highlightCourse={highlightCourse}
        contentWidth={elementWidth}
        setHighlightCourse={setHighlightCourse}
      />
    );
  }

  return (
    <div className={classes.root}>
      <Grid
        container
        display="flex"
        alignItems="baseline"
        justify="flex-start"
        className={classes.onlineAsyncList}
        style={{ height: headerSize }}
      >
        {onlineActivities.length > 0 && (
          <div>
            <div className={classes.onlinAsyncTitle}>Online Async: </div>
            {onlineActivities.map((activity, index) => {
              const color =
                (theme.palette.type === "dark"
                  ? getCourseManager()
                      .getCourseContronller(timetableIndex, activity.courseName)
                      .getCourseColor()
                  : getCourseManager()
                      .getCourseContronller(timetableIndex, activity.courseName)
                      .getCourseColor()) || theme.palette.background.paper;
              const highlightMe = highlightCourse === activity.courseName;
              const highlightOther = highlightCourse && !highlightMe;
              return (
                <Chip
                  key={`${activity.courseName} - ${activity.meetingName}`}
                  label={`${activity.courseName} - ${activity.meetingName}`}
                  variant="outlined"
                  size="small"
                  className={classes.onlineAsyncChip}
                  style={{
                    border: !highlightOther
                      ? `2px solid ${color}ee`
                      : `2px solid ${color}88`,
                    background: highlightMe ? `${color}66` : "initial",
                  }}
                />
              );
            })}
          </div>
        )}
      </Grid>
      <div className={classes.base}>
        <TimeLabel
          termName={termName}
          headerSize={headerSize}
          timeRange={timeRange}
          hourBlockHeightRatio={hourBlockHeightRatio}
          contentWidth={elementWidth}
        />
        <Box
          display="flex"
          flexDirection="row"
          flexGrow={1}
          className={classes.columnBox}
        >
          {timeColumns}
        </Box>
      </div>
    </div>
  );
}

export default Timetable;
