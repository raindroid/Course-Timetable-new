import { Avatar, Chip, CssBaseline, Grid, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import useWindowDimensions from "../../tools/useWindowDimensions";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CourseCard from "./CourseCard";
import { getCourseManager } from "../../controllers/CourseManager";
import { useForceUpdate } from "../../tools/useForceUpdate";
import { RiBook3Fill } from "react-icons/ri";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AccordionDetails from "@material-ui/core/AccordionDetails";

const useStyles = makeStyles((theme) => ({
  courseListRoot: {
    borderRadius: 8,
    border: "1px #8884 solid",
    margin: 0,
    padding: 2,
  },
  noCourseText: {
    flexGrow: 1,
    textAlign: "center",
    color: theme.palette.type === "dark" ? "#EEE6" : "#2225",
  },
  courseTag: {
    margin: "2px",
    padding: "2px",
    fontSize: "0.77rem",
  },
  contentContainer: {
    padding: 4,
  },
  courseTagGrid: {
    padding: 0,
    margin: 0,
  },
  accordionSummary: {
    minHeight: 24,
  },
  accordionSummaryContent: {
    padding: "0 10px",
    margin: "0 !important",
    fontSize: "1rem",
    "&$expanded": {
      minHeight: 0,
      padding: "0 12px",
      margin: "0 8px 0 0",
    },
  },
  accordionSummaryExpanded: {},
}));

function CourseList(props) {
  const classes = useStyles(props);
  const theme = useTheme();

  const { timetableIndex, drawerOpen, drawerWidth, setCourseView } = props;
  const { highlightCourse, setHighlightCourse, contentWidth } = props;
  const [expanded, setExpanded] = React.useState(true);
  const courseManager = getCourseManager();
  const courseListUpdater = useForceUpdate();
  useEffect(() => {
    courseManager.addUpdater(courseListUpdater);
    return () => {
      courseManager.removeUpdater(courseListUpdater);
    };
  }, []);
  const handleExpand = () => {
    setExpanded(!expanded);
  };

  const smSize = Math.ceil(
    12 / Math.max(1, Math.floor((contentWidth - 24) / 210))
  );

  let controllerList = [];
  if (courseManager.courseControllers[timetableIndex])
    Object.entries(
      courseManager.courseControllers[timetableIndex].controllers
    ).map(([_courseName, controller], index) =>
      controllerList.push(controller)
    );
  const cardSize = controllerList.length;
  const cardWidth = Math.floor(
    (contentWidth - 24) / Math.max(1, Math.min(cardSize, 12 / smSize)) - 16
  );

  const handleCourseMouseEnter = (courseName, controller) => {
    if (!controller.getDisabled()) setHighlightCourse(courseName);
  };
  const handleCourseMouseLeave = (courseName) => {
    if (highlightCourse === courseName) setHighlightCourse(false);
  };

  const smallCourseTags = controllerList.map((controller, index) => {
    return (
      <Chip
        className={classes.courseTag}
        key={controller.course.name}
        variant="outlined"
        size="small"
        label={controller.course.name}
        onMouseEnter={() =>
          handleCourseMouseEnter(controller.course.name, controller)
        }
        onMouseLeave={() => handleCourseMouseLeave(controller.course.name)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCourseMouseEnter(controller.course.name, controller);
          return false;
        }}
        avatar={
          <Avatar
            style={{
              backgroundColor:
                (theme.palette.type === "dark"
                  ? `${controller.getCourseColor()}dd`
                  : `${controller.getCourseColor()}dd`) ||
                theme.palette.background.paper,
            }}
          >
            {controller.course.name && controller.course.name.charAt(0)}
          </Avatar>
        }
      />
    );
  });

  return (
    <div>
      <CssBaseline />
      <Accordion
        expanded={expanded}
        onChange={handleExpand}
        classes={{ root: classes.accordionRoot }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          id="panel1a-header"
          classes={{
            root: classes.accordionSummary,
            content: classes.accordionSummaryContent,
            expanded: classes.accordionSummaryExpanded,
          }}
        >
          {expanded ? (
            <Typography variant="h6" component="div">
              Course List
            </Typography>
          ) : (
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
              className={classes.courseTagGrid}
            >
              {cardSize > 0 ? (
                smallCourseTags
              ) : (
                <Typography variant="h6" component="div">
                  Empty Course List
                </Typography>
              )}
            </Grid>
          )}
        </AccordionSummary>
        <AccordionDetails className={classes.contentContainer}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            className={classes.courseListRoot}
          >
            {cardSize > 0 ? (
              controllerList.map((controller, index) => (
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
                    onMouseEnter={() =>
                      handleCourseMouseEnter(controller.course.name, controller)
                    }
                    onMouseLeave={() =>
                      handleCourseMouseLeave(controller.course.name)
                    }
                  />
                </Grid>
              ))
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
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default CourseList;
