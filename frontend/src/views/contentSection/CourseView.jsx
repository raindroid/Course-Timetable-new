import { Box, Checkbox, Chip, Grid } from "@material-ui/core";
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
    minWidth: "350px",
    minHeight: "24px",
    maxHeight: "calc(92% - 68px)",

    overflow: "auto",
    margin: 0,
    padding: 0,
    borderRadius: 4,
    maxWidth: "calc(92% - 16px)",
    marginBottom: 16,
    transition: "all .3s ease-out",
    boxShadow: "none",
    background: theme.palette.type === "dark" ? "#555d" : "#fffa",
    "&:last-child": {
      padding: 16,
      margin: 0,
    },
  },
  heading: {
    padding: 0,
    margin: 0,
    transition: "all .3s ease-out",
  },
  title: {
    flexGrow: 1,
  },
  content: {
    background: "none",
    "&:last-child": {
      padding: 0,
    },
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

    transition: "all .3s ease-out",
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
          ? `${props.courseView.courseModel.color}cc`
          : `${props.courseView.courseModel.color}cc`
        : "#0000"),
    transition: "all .3s linear",
    "&:hover": {
      borderBottom: (props) =>
        "4px solid " +
        (props.courseView
          ? theme.palette.type === "dark"
            ? `${props.courseView.courseModel.color}ff`
            : `${props.courseView.courseModel.color}ff`
          : "#0000"),
    },
  },
  label: {
    margin: "4px",
    padding: "0 2px 0 2px",
  },
  sectionSwitch: {
    fontSize: "0.75rem",
    padding: "0 4px",
    margin: 0,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.65rem",
    },
  },
  sectionItem: {
    paddingTop: 6,
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingTop: 2,
    },
  },
  sectionDetail: {
    fontSize: "0.85rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.75rem",
    },
  },
  sectionName: {
    fontSize: "1rem",
    lineHeight: 1,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.85rem",
    },
  },
  sectionSelect: {
    borderRadius: 4,
    padding: 2,
    top: -1,
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
  const [showSections, setShowSections] = useState(false);

  if (!courseView && showSections) setShowSections(false);

  const controller =
    courseModel &&
    courseManager.getCourseContronller(timetableIndex, courseModel.name);
  const handleResultAdd = async () => {
    if (controller) {
      // remove course
      controller.delete();
      setShowSections(false);
    } else
      await courseManager.addTimetableCourse(timetableIndex, courseModel.name); // add new course
    appForceUpdate();
  };

  const handleShowSectionClick = async () => {
    if (!showSections) {
      if (!controller)
        await courseManager.addTimetableCourse(
          timetableIndex,
          courseModel.name
        ); // add new course
    }
    appForceUpdate();
    setShowSections(!showSections);
  };
  const handleSelectActivity = (act) => {
    controller.setSelectedActivity(act);
    console.log(act);
    appForceUpdate();
  };

  // display section detail
  const sectionList = [];
  if (controller) {
    const meetings = controller.course.getMeetingLists();
    meetings.map(({ type, activities }, index) => {
      console.log(activities);
      sectionList.push(
        <Divider key={`div-${index}`} />,
        <Typography
          key={`type-${index}`}
          variant="h6"
          style={{ padding: 0, fontWeight: "normal" }}
        >
          {type}
        </Typography>,
        ...activities.map((activity, actIndex) => (
          <Grid
            container
            justify="space-between"
            alignItems="center"
            direction="row"
            className={classes.sectionItem}
            key={`activity-${index}-${actIndex}`}
          >
            <Grid item xs={4}>
              <Typography className={classes.sectionName}>
                <Checkbox
                  checked={
                    controller.getSelectedActivity(type) === activity.name
                  }
                  color="default"
                  size="small"
                  className={classes.sectionSelect}
                  onClick={() =>
                    handleSelectActivity({ [type]: activity.name })
                  }
                />
                <strong>{activity.name}</strong>
                <br />
                <span className={classes.sectionDetail}>
                  &nbsp;
                  {activity.deliveryMode && `(${activity.deliveryMode})`}
                </span>
              </Typography>
            </Grid>
            <Grid
              item
              xs={5}
              container
              direction="column"
              alignItems="flex-start"
              justify="flex-start"
            >
              {activity.time && activity.time.length > 0 ? (
                activity.time.map((t) => (
                  <Typography
                    xs={3}
                    variant="body1"
                    className={classes.sectionDetail}
                  >
                    {t || "TBD"}
                  </Typography>
                ))
              ) : (
                <Typography
                  xs={3}
                  variant="body1"
                  className={classes.sectionDetail}
                >
                  TBD
                </Typography>
              )}
            </Grid>
            <Grid item xs={3}>
              <Typography
                xs={3}
                variant="body1"
                className={classes.sectionDetail}
              >
                {activity.instructor || "TBD"}
              </Typography>
            </Grid>
          </Grid>
        ))
      );
    });
  }

  return (
    <div className={classes.root} onClick={handleToggleCourseView}>
      {courseModel && (
        <Card className={classes.mainCard} onClick={(e) => e.stopPropagation()}>
          <CardContent className={classes.content}>
            <Typography
              className={classes.heading}
              color="textSecondary"
              gutterBottom
            >
              {courseModel.organization}{" "}
              {courseModel.termType && ` - ${courseModel.termName} Term`}
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

              <IconButton className={classes.addIcon} onClick={handleResultAdd}>
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

            <Box display="flex">
              <Typography className={classes.title} color="textSecondary">
                {courseModel.title}
              </Typography>

              <Button
                className={classes.sectionSwitch}
                onClick={handleShowSectionClick}
              >
                {showSections ? "Hide Sections" : "Show Sections"}
              </Button>
            </Box>
            {showSections ? (
              <div>{sectionList}</div>
            ) : (
              <div>
                <Typography
                  variant="body2"
                  component="p"
                  className={classes.description}
                >
                  {courseModel.description}
                </Typography>

                <Divider className={classes.divider} />
                {courseModel.AUs && (
                  <Typography
                    variant="body2"
                    component="p"
                    className={classes.description}
                  >
                    <strong>Course AUs: </strong>
                    {courseModel.AUs}
                  </Typography>
                )}
                {courseModel.credit && (
                  <Typography
                    variant="body2"
                    component="p"
                    className={classes.description}
                  >
                    <strong>Course Credit: </strong>
                    {courseModel.credit}
                  </Typography>
                )}
                {courseModel.hours && (
                  <Typography
                    variant="body2"
                    component="p"
                    className={classes.description}
                  >
                    <strong>Course Hours: </strong>
                    {courseModel.hours}
                  </Typography>
                )}
                <Divider className={classes.divider} />
                {courseModel.labels &&
                  courseModel.labels.map((label, index) => {
                    return (
                      <Chip
                        key={label}
                        label={label}
                        id={index}
                        className={classes.label}
                        size="small"
                      />
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CourseView;
