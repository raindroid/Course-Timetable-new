import {
  Box,
  colors,
  makeStyles,
  Typography,
  useTheme,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { getCourseManager } from "../../../controllers/CourseManager";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Chip from "@material-ui/core/Chip";
import useWindowDimensions from "../../../tools/useWindowDimensions";

const useStyle = makeStyles((theme) => ({
  actCardRoot: {
    borderRadius: 4,
    transition: "all .18s linear",
    position: "absolute",
    opacity: (props) => (props.disabled ? 0.35 : 1),
    left: (props) => (props.highlightMe ? 0 : props.adjust.left || 0),
    right: (props) => (props.highlightMe ? 0 : props.adjust.right || 0),
    boxShadow:
      "rgba(0, 0, 0, 0.24) 0px 10px 20px, rgba(0, 0, 0, 0.12) 0px 7px 7px",
    "&:hover": {
      boxShadow: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)",
      zIndex: "110",
    },
    backdropFilter: (props) => (!props.highlightOther ? "blur(4px)" : "none"),
    WebkitBackdropFilter: (props) =>
      !props.highlightOther ? "blur(4px)" : "none",
    zIndex: (props) => (props.highlightMe ? 100 : ""),
    filter: (props) =>
      !props.highlightOther ? "" : "brightness(0.8) blur(1px)",
    top: (props) => props.timeTop * 70 * props.hourBlockHeightRatio,
    height: (props) => props.timeHeight * 70 * props.hourBlockHeightRatio - 4,
    [theme.breakpoints.down("md")]: {
      top: (props) => props.timeTop * 60 * props.hourBlockHeightRatio,
      height: (props) => props.timeHeight * 60 * props.hourBlockHeightRatio - 4,
    },
    [theme.breakpoints.down("xs")]: {
      backdropFilter: (props) => (!props.highlightOther ? "blur(2px)" : "none"),
      WebkitBackdropFilter: (props) =>
        !props.highlightOther ? "blur(2px)" : "none",
      filter: (props) => (!props.highlightOther ? "" : "brightness(0.8) "),
      transition: "all .1s linear",
    },
  },
  actCardContent: {
    height: "100%",
    background: theme.palette.type === "dark" ? `#11111166` : `#eeeeee77`,
    transition: "all .2s linear",
    display: "flex",
    margin: 0,
    padding: 2,
    justifyContent: "flex-start",
    "&:last-child": {
      paddingBottom: 0,
    },
  },
  actCardContentContainer: {
    padding: 0,
    margin: 0,
    width: "100%",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  actCardTitle: {
    padding: 0,
    margin: "0 auto",
    width: "calc(100% - 8px)",
    overflow: "hidden",
    whiteSpace: "nowrap",
    height: 19,
    color: theme.palette.text.primary,
    fontSize: "0.9rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8rem",
    },
  },
  actCardType: {
    padding: 0,
    margin: 0,
    height: 18,
    marginTop: 4,
    color: theme.palette.text.primary,
    fontSize: "0.7rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.6rem",
      height: 12,
      fontWeight: "bold",
    },
  },
  actCardTypeLec: {
    background: colors["yellow"][800],
    color: "white",
  },
  actCardTypeTut: {
    background: colors["green"][800],
    color: "white",
  },
  actCardTypePra: {
    background: colors["blue"][800],
    color: "white",
  },
  actCardSection: {
    padding: 0,
    margin: 0,
    fontSize: "0.8rem",
    overflow: "hidden",
    whiteSpace: "nowrap",
    color: theme.palette.text.primary,
  },
  actCardDetail: {
    padding: 0,
    margin: 0,
    fontSize: "0.8rem",
    overflow: "hidden",
    whiteSpace: "nowrap",
    color: theme.palette.text.primary,
  },
}));

function TimeCard(props) {
  const classes = useStyle(props);
  const theme = useTheme();
  const {
    activity,
    timeTop,
    timeHeight,
    hourBlockHeightRatio,
    timetableIndex,
    highlightOther,
    highlightMe,
    onMouseEnter,
    onMouseLeave,
    contentWidth,
    disabled,
  } = props;

  const smallerWidth = Boolean(contentWidth < 800);

  const courseName = activity.courseName;
  const type = activity.meetingType;
  const mName = activity.meetingName;

  const instructor = activity.instructor;
  const meetingLocation = activity.meetingLocation;
  const deliveryMode = activity.deliveryMode;

  const courseTitle = getCourseManager().getCourseContronller(
    timetableIndex,
    courseName
  ).course.title;
  const color = getCourseManager()
    .getCourseContronller(timetableIndex, courseName)
    .getCourseColor();

  let displayName = courseName;
  ["H1", "Y1", "H0", "Y0"].map((uselessSuffic) => {
    if (courseName.indexOf(uselessSuffic) !== -1)
      displayName = courseName.substring(0, courseName.indexOf(uselessSuffic));
  });

  const typeStyles = {
    LEC: classes.actCardTypeLec,
    TUT: classes.actCardTypeTut,
    PRA: classes.actCardTypePra,
  };
  const colorfulStyle = {
    backgroundColor: color,
  };
  const greyStyle = {
    backgroundColor: theme.palette.type === "dark" ? "grey" : "#eee5",
    border: `2px solid ${color}99`,
  };
  const detailInfo = [
    instructor && instructor.length > 1 && instructor.join("; "),
    deliveryMode && deliveryMode,
  ]
    .filter((e) => Boolean(e))
    .join(".");
  return (
    <Card
      style={{
        ...greyStyle,
      }}
      className={classes.actCardRoot}
      onMouseEnter={disabled ? () => {} : onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardContent className={classes.actCardContent} style={{}}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="center"
          className={classes.actCardContentContainer}
        >
          <Typography
            className={classes.actCardTitle}
            style={{ width: smallerWidth ? "auto" : "initial" }}
          >
            {displayName} {!smallerWidth && `- ${courseTitle}`}
          </Typography>
          <Chip
            className={
              classes.actCardType + ` ${typeStyles[type && type.toUpperCase()]}`
            }
            label={mName}
          />

          {/* <Typography className={classes.actCardDetail}>
            {detailInfo}
          </Typography> */}
        </Box>
      </CardContent>
    </Card>
  );
}

export default TimeCard;
