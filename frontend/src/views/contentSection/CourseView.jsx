import { Box } from "@material-ui/core";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core";
import zIndex from "@material-ui/core/styles/zIndex";
import React, { useState, useEffect } from "react";
import "../../App.css";

import { MdCheckBox, MdAddBox } from "react-icons/md";
import { getCourseManager } from "../../controllers/CourseManager";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: (props) =>
      props.courseView ? props.courseView.zIndex || "1000" : "-1",
    position: "fixed",
    background: "#0003",
    top: (props) => props.topBarHeight,
    left: 0,
    [theme.breakpoints.up("sm")]: {
      left: (props) => props.drawerWidth,
    },
    right: 0,
    bottom: 0,
    opacity: (props) => (props.courseView ? "100%" : "0%"),
    transition: "all .3s ease-in-out",
    backdropFilter: (props) => (props.courseView ? "blur(18px)" : "blur(1px)"),
    WebkitBackdropFilter: (props) =>
      props.courseView ? "blur(18px)" : "blur(1px)",
  },
  mainCard: {
    // background: "#9fda9c33",
    width: "fit-content",
    height: "fit-content",
    margin: 8,
    padding: 12,
    [theme.breakpoints.up("sm")]: {
      margin: 4,
      padding: 6,
    },
    maxWidth: "calc(92% - 16px)",
    marginBottom: 16,
    transition: "all .3s ease-out",
    boxShadow: "none",
    background: theme.palette.type === "dark" ? "#555d" : "#fffa",
  },
  name: {
    paddingBottom: "0px",
  },
  divider: {
    margin: 4,
  },
  description: {
    marginTop: 4,
    fontSize: "0.9rem",
  },
  addIcon: {
    display: "flex",
    minWidth: "36px",
    margin: "0",
    padding: "2px",
    borderRadius: "2px",
    "&:hover": {
      background: "none",
    },
  },
  addIconPic: {
    width: "36px",
    height: "36px",
    borderRadius: "4px",
    padding: "4px",
    transition: "background .3s linear, all .4s ease-in-out",
    position: "absolute",
    "&:hover": {
      background: "#EEE2",
    },
  },
  link: {
    color: theme.palette.type === "dark" ? "#fff" : "#000",
    fontSize: "1.6rem",
    borderBottom: (props) =>
      "4px solid " +
      (props.courseView
        ? theme.palette.type === "dark"
          ? `${props.courseView.courseModel.color}dd`
          : `${props.courseView.courseModel.color}DD`
        : "#0000"),
    transition: "all .3s linear",
    "&:hover": {
      borderBottom: (props) =>
        "4px solid " +
        (props.courseView
          ? theme.palette.type === "dark"
            ? `${props.courseView.courseModel.color}ff`
            : `${props.courseView.courseModel.color}DD`
          : "#0000"),
    },
  },
}));

function CourseView(props) {
  const classes = useStyles(props);
  const { courseView, setCourseView } = props;

  const handleToggleCourseView = () => {
    setCourseView("");
  };
  const courseManager = getCourseManager();
  const courseModel = courseView && courseView.courseModel;
  const { timetableIndex, appForceUpdate } = props;
  const handleResultAdd = async (courseName) => {
    const controller = courseManager.getCourseContronller(
      timetableIndex,
      courseName
    );
    if (controller) controller.delete();
    // remove course
    else await courseManager.addTimetableCourse(timetableIndex, courseName); // add new course
    appForceUpdate();
  };

  return (
    <div className={classes.root} onClick={handleToggleCourseView}>
      {courseModel && (
        <Card className={classes.mainCard} onClick={(e) => e.stopPropagation()}>
          <CardContent>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              {courseModel.organization} - {courseModel.termName} Term
            </Typography>
            <Box display="flex" alignItems="center">
              <Box flexGrow={1}>
                <Typography
                  variant="h6"
                  component="h2"
                  className={classes.name}
                >
                  <a
                    href={courseModel.link}
                    target="_blank"
                    rel="noreferrer"
                    className={classes.link}
                  >
                    {courseModel.name}
                  </a>
                </Typography>
              </Box>

              <IconButton
                className={classes.addIcon}
                onClick={() => handleResultAdd(courseModel.name)}
              >
                <MdAddBox
                  className={
                    classes.addIconPic +
                    (courseManager.getCourseContronller(
                      timetableIndex,
                      courseModel.name
                    )
                      ? " iconBack"
                      : " iconFront")
                  }
                />
                <MdCheckBox
                  className={
                    classes.addIconPic +
                    (courseManager.getCourseContronller(
                      timetableIndex,
                      courseModel.name
                    )
                      ? " iconFront"
                      : " iconBack")
                  }
                />
              </IconButton>
            </Box>

            <Typography className={classes.title} color="textSecondary">
              {courseModel.title}
            </Typography>
            <Typography
              variant="body2"
              component="p"
              className={classes.description}
            >
              {courseModel.description}
            </Typography>
            <Divider className={classes.divider} />

            <Typography
              variant="body2"
              component="p"
              className={classes.description}
            >
              {courseModel.description}
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CourseView;
