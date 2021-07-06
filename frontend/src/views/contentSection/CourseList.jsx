import { CssBaseline, Grid, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import useWindowDimensions from "../../tools/useWindowDimensions";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CourseCard from "./CourseCard";
import { getCourseManager } from "../../controllers/CourseManager";
import { useForceUpdate } from "../../tools/useForceUpdate";

const useStyles = makeStyles((theme) => ({
  courseListRoot: {
    borderRadius: 8,
    border: "1px #8884 solid",
  },
  noCourseText: {
    flexGrow: 1,
    textAlign: "center",
    color: theme.palette.type === "dark" ? "#EEE6" : "#2225",
  },
}));

function CourseList(props) {
  const classes = useStyles(props);
  const { height, width } = useWindowDimensions();

  const { timetableIndex, drawerOpen, drawerWidth, setCourseView } = props;
  const courseManager = getCourseManager();
  const courseListUpdater = useForceUpdate();
  useEffect(() => {
    courseManager.addUpdater(courseListUpdater);
    return () => {
      courseManager.removeUpdater(courseListUpdater);
    };
  }, []);

  const smSize = Math.ceil(
    12 / Math.max(1, Math.floor((width - 16 - 8 - drawerWidth) / 210))
  );

  let controllerList = [];
  if (courseManager.courseControllers[timetableIndex])
    Object.entries(
      courseManager.courseControllers[timetableIndex].controllers
    ).map(([courseName, controller], index) => controllerList.push(controller));
  const cardSize = controllerList.length;
  const cardWidth = Math.floor(
    (width - 16 - 8 - drawerWidth) /
      Math.max(1, Math.min(cardSize, 12 / smSize)) -
      16
  );

  return (
    <div>
      <CssBaseline />
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        className={classes.courseListRoot}
      >
        {cardSize > 0 ? (
          controllerList.map(
            (controller, index) => (
              <Grid
                item
                xs={12}
                sm={smSize}
                style={{ maxWidth: "100%" }}
                key={controller.course.name}
              >
                <CourseCard
                  courseController={controller}
                  cardWidth={cardWidth}
                  setCourseView={setCourseView}
                />
              </Grid>
            )
          )
        ) : (
          <Typography
            variant="h4"
            component="div"
            className={classes.noCourseText}
          >
            No Course Selected
          </Typography>
        )}
      </Grid>
    </div>
  );
}

export default CourseList;
