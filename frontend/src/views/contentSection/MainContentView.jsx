import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CourseList from "./CourseList";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: "all .8s ease-in-out",
  },
}));

function MainContentView(props) {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div className={classes.content}>
      <div className={classes.toolbar} />
      <div className={classes.content}>
        <CourseList />
      </div>
    </div>
  );
}

export default MainContentView;
