import React, { Component, useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CourseList from "./CourseList";
import { LinearProgress, Divider, Grid, Box, IconButton } from "@material-ui/core";
import Timetable from "./Timetable";
import useWindowDimensions from "../../tools/useWindowDimensions";
import TimeManager from "../../controllers/TimeManager";
import { useForceUpdate } from "../../tools/useForceUpdate";
import { getCourseManager } from "../../controllers/CourseManager";

const useStyles = makeStyles((theme) => ({
  contentRoot: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: (props) => `calc(100vw - ${props.drawerWidth}px)`,
    },
  },
  // necessary for content to be below app bar
  toolbar: {
    minHeight: (props) => props.topBarHeight,
    width: "1vw",
    transition: "all .24s ease-in-out",
  },
  content: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: (props) => `calc(100vw - ${props.drawerWidth}px)`,
    },
    flexGrow: 1,
    padding: theme.spacing(2.5, 1),
    transition: "all .8s ease-in-out",
  },
  progressBar: {
    borderRadius: 10,
    margin: 9,
  },
}));

function MainContentView(props) {
  const classes = useStyles(props);
  const theme = useTheme();
  const { drawerOpen, drawerWidth, dataLoad, timetableIndex, setCourseView } =
    props;
  const [highlightCourse, setHighlightCourse] = useState(false);
  const [timeTableDisplayRatio, setTimeTableDisplayRatio] = useState({
    w: 1.0,
    h: 1.0,
  });

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    getCourseManager().addUpdater(forceUpdate);
    return () => {
      getCourseManager().removeUpdater(forceUpdate);
    };
  }, []);

  const windowDimenstion = useWindowDimensions();
  const timeManager = new TimeManager(timetableIndex);
  const terms = timeManager && timeManager.getSelectedTerms();

  const contentWidth =
    windowDimenstion.width -
    (windowDimenstion.width > 600 && drawerOpen ? drawerWidth : 0);

  return (
    <div className={classes.contentRoot}>
      <div className={classes.toolbar} />
      {dataLoad ? (
        <div className={classes.content}>
          <CourseList
            drawerWidth={drawerWidth}
            timetableIndex={timetableIndex}
            drawerOpen={drawerOpen}
            setCourseView={setCourseView}
            setHighlightCourse={setHighlightCourse}
            highlightCourse={highlightCourse}
            contentWidth={contentWidth}
          />
        </div>
      ) : (
        <LinearProgress className={classes.progressBar} />
      )}
      <Box display="flex">
        <IconButton>
          
        </IconButton>
      </Box>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        style={{ width: contentWidth, margin: 0, padding: 0 }}
        onMouseEnter={() => setHighlightCourse(false)}
      >
        {timeManager &&
          Object.entries(terms).map(([termName, activities], index) => (
            <Grid
              item
              xs={contentWidth < 1400 ? 12 : 6}
              key={termName}
              style={{ width: "100%", margin: 0, padding: 0 }}
            >
              {index !== -1 && <Divider />}
              <Timetable
                drawerWidth={drawerWidth}
                timetableIndex={timetableIndex}
                drawerOpen={drawerOpen}
                setCourseView={setCourseView}
                timeManager={timeManager}
                termName={termName}
                activities={activities}
                highlightCourse={highlightCourse}
                contentWidth={contentWidth}
                timeTableDisplayRatio={timeTableDisplayRatio}
                setTimeTableDisplayRatio={setTimeTableDisplayRatio}
                setHighlightCourse={setHighlightCourse}
              />
            </Grid>
          ))}
      </Grid>
    </div>
  );
}

export default MainContentView;
