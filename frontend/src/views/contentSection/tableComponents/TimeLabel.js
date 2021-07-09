import React, { useState, useEffect } from "react";

import Timeline from "@material-ui/lab/Timeline";
import TimelineItem from "@material-ui/lab/TimelineItem";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import TimelineConnector from "@material-ui/lab/TimelineConnector";
import TimelineContent from "@material-ui/lab/TimelineContent";
import TimelineDot from "@material-ui/lab/TimelineDot";
import { Box, makeStyles, Typography } from "@material-ui/core";
import "../../../App.css";
import useWindowDimensions from "../../../tools/useWindowDimensions";
const useStyle = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: 0,
    alignItems: "flex-end",
  },
  header: {
    margin: 0,
    padding: 0,
    height: (props) => props.headerSize,
    display: "flex",
  },
  headerText: {
    margin: 0,
    padding: 0,
    textAlign: "center",
    fontSize: "0.9rem",
    alignSelf: "center",
    fontFamily: "Encode Sans SC, sans-serif",
  },
  timelineItem: {
    height: (props) => props.hourBlockHeightRatio * 70,
    minHeight: "20px",
    "&::before": {
      padding: 0,
    },
    padding: 0,
    margin: 0,
    transition: "height .2s linear",
    [theme.breakpoints.down("md")]: {
      height: (props) => props.hourBlockHeightRatio * 60,
    },
  },

  timelineItemLast: {
    height: "20px !important",
    [theme.breakpoints.down("md")]: {
      height: "20px !important",
    },
  },
  sepDot: {
    padding: 4,
    [theme.breakpoints.down("md")]: {
      padding: 2,
    },
    [theme.breakpoints.down("xs")]: {
      padding: 1,
    },
    transition: "padding .2s linear",
  },
  sepLine: {},
  sepContent: {
    fontSize: "0.9rem",
    padding: "6px 16px 0 16px",
    [theme.breakpoints.down("md")]: {
      padding: "6px 10px 0 8px",
    },
    [theme.breakpoints.down("xs")]: {
      padding: "6px 6px 0 4px",
      fontSize: "0.8rem",
    },
    transition: "padding .2s linear",
    fontFamily: "Encode Sans SC, sans-serif",
  },
}));
function TimeLabel(props) {
  const classes = useStyle(props);
  const { termName, timeRange, contentWidth } = props;

  const timeDots = [];
  if (timeRange && timeRange.length === 2) {
    for (
      let timePoint = parseInt(timeRange[0]);
      timePoint <= timeRange[1];
      timePoint++
    ) {
      timeDots.push(
        <TimelineItem
          key={timePoint}
          className={
            classes.timelineItem +
            (timePoint >= timeRange[1] - 0.99
              ? ` ${classes.timelineItemLast}`
              : "")
          }
        >
          <TimelineSeparator>
            <TimelineDot className={classes.sepDot} />
            {timePoint < timeRange[1] - 0.99 && (
              <TimelineConnector className={classes.sepLine} />
            )}
          </TimelineSeparator>
          <TimelineContent className={classes.sepContent}>
            {timePoint}
            {contentWidth >= 600 && ":00"}
          </TimelineContent>
        </TimelineItem>
      );
    }
  }

  return (
    <Box
      flexShrink={1}
      display="flex"
      flexDirection="column"
      className={classes.root}
    >
      <div className={classes.header}>
        <Typography variant="h6" component="div" className={classes.headerText}>
          {termName}
        </Typography>
      </div>
      <Timeline align="right" className={classes.root}>
        {timeDots}
      </Timeline>
    </Box>
  );
}

export default TimeLabel;
