import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CourseList from "./CourseList";

const useStyles = makeStyles((theme) => ({
  contentRoot: {
    display: "flex",
    flexDirection: "column",
    width: "100vw",
    [theme.breakpoints.up("sm")]: {
      width: (props) => `calc(100vw - ${props.drawerWidth}px)`,
    },
  },
  // necessary for content to be below app bar
  toolbar: {
    minHeight: props => props.topBarHeight,
    width: "100vw",
    transition: "all .24s ease-in-out"
  },
  content: {
    width: "100%",
    flexGrow: 1,
    padding: theme.spacing(2.5, 1),
    transition: "all .8s ease-in-out",
  },
}));

function MainContentView(props) {
  const classes = useStyles(props);
  const theme = useTheme();
  return (
    <div className={classes.contentRoot}>
      <div className={classes.toolbar} />
      <div className={classes.content}>
        <CourseList drawerWidth={props.drawerWidth}/>
      </div>
    </div>
  );
}

export default MainContentView;
