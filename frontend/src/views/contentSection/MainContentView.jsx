import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CourseList from "./CourseList";
import { LinearProgress } from "@material-ui/core";

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
  const { drawerOpen, dataLoad, timetableIndex, setCourseView } = props;

  return (
    <div className={classes.contentRoot}>
      <div className={classes.toolbar} />
      {dataLoad ? (
        <div className={classes.content}>
          <CourseList
            drawerWidth={props.drawerWidth}
            timetableIndex={timetableIndex}
            drawerOpen={drawerOpen}
            setCourseView={setCourseView}
          />
        </div>
      ) : (
        <LinearProgress className={classes.progressBar} />
      )}
    </div>
  );
}

export default MainContentView;
