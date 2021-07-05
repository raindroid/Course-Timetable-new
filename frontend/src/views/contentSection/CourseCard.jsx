import React, { useState, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { CourseModel } from "../../models/CourseModel";
import { Box, Collapse, Divider, IconButton } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { FaExpandAlt } from "react-icons/fa";
import { BiShow, BiHide } from "react-icons/bi";
import { Checkbox } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    maxWidth: "510px",
    width: props => props.cardWidth,
    margin: "8px",
    backgroundColor: (props) =>
      (theme.palette.type
        ? `${props.courseController.course.color}66`
        : `${props.courseController.course.color}DD`) || theme.palette.background.paper,
    transition: "all .3s linear",
    
  },
  rootDisabled: {
    opacity: 10,
    backgroundColor: (props) =>
      (theme.palette.type
        ? `${props.courseController.course.color}33`
        : `${props.courseController.course.color}77`) || theme.palette.background.paper,
    background:
      "repeating-linear-gradient( 45deg, #3332, #4445 12px, #6665 12px, #2222 24px )",
  },
  heading: {
    fontSize: "0.9rem",
    paddingBottom: "0px",
  },
  description: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: "0.8rem",
  },
  title: {
    marginBottom: 4,
  },
  name: {
    paddingBottom: "0px",
  },
  hideIcon: {
    display: "flex",
    minWidth: "32px",
    margin: "0",
    padding: "2px",
    paddingLeft: "0",
    borderRadius: "2px",
    "&:hover": {
      background: "none",
    },
  },
  expandIcon: {
    display: "flex",
    minWidth: "32px",
    margin: "0",
    padding: "2px",
    borderRadius: "2px",
    "&:hover": {
      background: "none",
    },
  },
  expandIconPic: {
    width: "28px",
    height: "28px",
    borderRadius: "4px",
    padding: "6px",
    transition: "background .3s linear",
    "&:hover": {
      background: "#EEE6",
    },
    "&:active": {
      background: `${theme.palette.action.active}8`,
    },
  },
  timeExpandIcon: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
    display: "flex",
    minWidth: "32px",
    margin: "0",
    padding: "2px",
    borderRadius: "2px",
    "&:hover": {
      background: "none",
    },
  },
  timeExpandIconOpen: {
    transform: "rotate(180deg)",
  },
  timeExpandIconPic: {
    width: "28px",
    height: "28px",
    borderRadius: "28px",
    padding: "6px",
    transition: "background .3s linear",
    "&:hover": {
      background: "#EEE3",
    },
    "&:active": {
      background: `${theme.palette.action.active}4`,
    },
  },
  cardAction: {
    padding: 12,
    paddingTop: 2,
    paddingBottom: 2,
  },
  timeCardContent: {
    padding: 6,
    paddingTop: 0,
    paddingBottom: 8,
    marginLeft: "8px",
    marginRight: "8px",
    "&:last-child": {
      paddingBottom: 8,
    },
  },
  activityButton: {
    width: "fix-content",
    padding: "0 4px 0 4px",
    borderRadius: 4,
    margin: "4px 0 4px 0.75rem",
    fontSize: "0.83rem",
    transition: "all .2s linear",
    border: "1px solid " + (theme.palette.type === "dark" ? "#fff2" : "#0003"),
    boxShadow: "none",
    "&:hover": {
      border:
        "1px solid " + (theme.palette.type === "dark" ? "#fff2" : "#0003"),
      boxShadow: "none",
      background: theme.palette.buttonHover,
    },
    "&:active": {
      background: `${theme.palette.action.active}8`,
    },
  },
  activityTypeName: {
    minWidth: "32px",
    display: "inline",
  },
}));

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

function CourseCard(props) {
  const { courseController } = props;
  const courseModel = courseController.course;
  const classes = useStyles(props);
  const theme = useTheme();

  const [timePanelOpen, setTimePanelOpen] = useState(false);
  const handleTimeExpandIconClick = () => {
    setTimePanelOpen(!timePanelOpen);
  };

  const handleActivitySelect = (type, activityName) => {
    courseController.setSelectedActivity({ [type]: activityName });
  };

  const forceUpdate = useForceUpdate();
  useEffect(() => {
    courseController.addUpdater(forceUpdate);
    return () => {
      courseController.removeUpdater(forceUpdate);
    };
  }, []);

  const getAllMeetings = () => {
    const sections = [];
    for (const meetings of courseModel.meetings) {
      const type = meetings.meetingType;
      sections.push(<Divider></Divider>);

      const meetingSection = [];
      for (const activity of meetings.activities) {
        const name = activity.meetingName;
        meetingSection.push(
          <Box component="div" key={name} display="inline">
            <Button
              variant={
                courseController.getSelectedActivity(type) === name
                  ? "contained"
                  : "outlined"
              }
              className={classes.activityButton}
              onClick={() => handleActivitySelect(type, name)}
            >
              {name}
            </Button>
          </Box>
        );
      }
      sections.push(
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
          key={type}
        >
          <Grid
            item
            xs={1}
            className={classes.activityTypeName}
            display="inline"
          >
            <span>{type}</span>
          </Grid>
          {meetingSection}
        </Grid>
      );
    }
    return sections;
  };

  return (
    <Card
      className={
        `${classes.cardRoot}` +
        (courseController.states.disabled ? ` ${classes.rootDisabled}` : "")
      }
    >
      <CardContent style={{ padding: 12 }}>
        <Typography className={classes.heading} color="textSecondary">
          {courseModel.organization}
        </Typography>

        <Box display="flex">
          <Box flexGrow={1}>
            <Typography variant="h6" component="h2" className={classes.name}>
              {courseModel.name}
            </Typography>
          </Box>
          <IconButton
            className={classes.hideIcon}
            onClick={() =>
              courseController.setDisable(!courseController.states.disabled)
            }
          >
            {(!courseController.states.disabled && (
              <BiShow className={classes.expandIconPic} />
            )) || <BiHide className={classes.expandIconPic} />}
          </IconButton>
          <IconButton className={classes.expandIcon}>
            <FaExpandAlt className={classes.expandIconPic} />
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
      </CardContent>
      <Divider />
      <CardActions className={classes.cardAction}>
        <Box flexGrow={1}>
          <Typography variant="body1">Availability</Typography>
        </Box>

        <IconButton
          className={
            `${classes.timeExpandIcon}` +
            (timePanelOpen ? ` ${classes.timeExpandIconOpen}` : "")
          }
          onClick={handleTimeExpandIconClick}
          aria-expanded={timePanelOpen}
          aria-label="show more"
        >
          <ExpandMoreIcon className={classes.timeExpandIconPic} />
        </IconButton>
      </CardActions>
      <Collapse in={timePanelOpen} timeout="auto" unmountOnExit>
        <CardContent className={classes.timeCardContent}>
          {getAllMeetings()}
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default CourseCard;
