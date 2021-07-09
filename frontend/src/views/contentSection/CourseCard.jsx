import React, { useState, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { CourseModel } from "../../models/CourseModel";
import { Box, Collapse, Divider, IconButton, Popover } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { FaExpandAlt } from "react-icons/fa";
import { MdClear } from "react-icons/md";
import { BiShow, BiHide } from "react-icons/bi";
import { RiDeleteBack2Fill, RiDeleteBin6Line } from "react-icons/ri";

import { Checkbox, Tooltip } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { useForceUpdate } from "../../tools/useForceUpdate";
import { LeakRemoveTwoTone } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    maxWidth: "510px",
    width: "calc(100% - 16px)",

    [theme.breakpoints.up("sm")]: {
      width: (props) => props.cardWidth,
    },
    margin: "4px",
    backgroundColor: (props) =>
      (theme.palette.type === "dark"
        ? `${props.courseController.getCourseColor()}66`
        : `${props.courseController.getCourseColor()}88`) ||
      theme.palette.background.paper,
    transition: "all .2s linear",
  },
  rootDisabled: {
    opacity: 10,
    backgroundColor: (props) =>
      (theme.palette.type === "dark"
        ? `${props.courseController.getCourseColor()}33`
        : `${props.courseController.getCourseColor()}77`) ||
      theme.palette.background.paper,
    background:
      "repeating-linear-gradient( 45deg, #3332, #4445 12px, #6665 12px, #2222 24px )",
  },
  heading: {
    fontSize: "0.9rem",
    paddingBottom: "0px",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  description: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: "0.8rem",
  },
  title: {
    marginBottom: 4,
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: "0.9rem",
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
  delIcon: {
    display: "flex",
    minWidth: "24px",
    margin: "0",
    padding: "2px",
    borderRadius: "2px",
    "&:hover": {
      background: "none",
    },
  },
  delIconPic: {
    width: "22px",
    height: "22px",
    borderRadius: "4px",
    padding: "2px",
    transition: "background .3s linear",
    "&:hover": {
      background: "#EEE6",
    },
    "&:active": {
      background: `${theme.palette.action.active}8`,
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
    margin: 0,
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
    padding: (props) => (props.cardWidth > 240 ? "0 4px 0 4px" : "0 2px 0 2px"),
    borderRadius: 4,
    margin: (props) =>
      props.cardWidth > 240 ? "4px 0 4px 0.75rem" : "2px 0 2px 4px",
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
    fontSize: "0.8rem",
    minWidth: "28px",
    display: "inline",
  },
  delComfirmationPopover: {
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    background: theme.palette.type === "dark" ? "#0006" : "#fff5",
  },
  delComfirmationText: {
    fontSize: "0.9rem",
    margin: "8px",
  },
  delComfirmationDel: {
    color: theme.palette.type === "dark" ? "#f8a" : "#f88",
  },
  activityHint: {
    flexGrow: 1,
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: "0.9rem",
  },
}));

const dayNames = ["Online", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CourseCard(props) {
  const classes = useStyles(props);
  const theme = useTheme();

  const { courseController, setCourseView } = props;
  const courseModel = courseController.course;
  const [timePanelOpen, setTimePanelOpen] = useState(false);
  const [delConfirmAnchorEl, setDelConfirmAnchorEl] = useState(null);
  const { onMouseEnter, onMouseLeave } = props;

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

  const activities = [];
  const allMeetings = (() => {
    const sections = [];
    for (const meetings of courseModel.meetings) {
      const type = meetings.meetingType;
      sections.push(<Divider key={`divider-${type}`}></Divider>);

      const meetingSection = [];
      for (const activity of meetings.activities) {
        const name = activity.meetingName;
        const selected = courseController.getSelectedActivity(type) === name;
        if (selected) activities.push(name);

        let meetingTimes = activity.detail.map(
          (detail) =>
            `${dayNames[detail.meetingDay]} ${detail.meetingStartTime}~${
              detail.meetingEndTime
            }`
        );
        meetingTimes = [...new Set(meetingTimes)];

        meetingSection.push(
          <Box component="div" key={name} display="inline">
            <Tooltip
              title={meetingTimes.map((element) => (
                <div>
                  {element}
                  <br />
                </div>
              ))}
              arrow
            >
              <Button
                variant={selected ? "contained" : "outlined"}
                className={classes.activityButton}
                onClick={() => handleActivitySelect(type, name)}
              >
                {name.replace(type, "")}
              </Button>
            </Tooltip>
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
  })();

  // Delete confirmation
  const delConfirmOpen = Boolean(delConfirmAnchorEl);
  const delId = delConfirmOpen ? `${courseModel.name}-del` : undefined;
  const handleDelConfirmationClose = () => setDelConfirmAnchorEl(null);
  const handleCourseDelete = (course) => {
    courseController.delete();
    handleDelConfirmationClose();
  };

  return (
    <Card
      className={
        `${classes.cardRoot}` +
        (courseController.states.disabled ? ` ${classes.rootDisabled}` : "")
      }
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardContent style={{ padding: 12 }}>
        <Box display="flex" style={{ alignItem: "center" }}>
          <Box
            flexGrow={1}
            style={{
              width: "80%",
            }}
          >
            <Typography className={classes.heading} color="textSecondary">
              {courseModel.organization}
            </Typography>
          </Box>

          <IconButton
            aria-describedby={delId}
            className={classes.delIcon}
            onClick={(e) => setDelConfirmAnchorEl(e.currentTarget)}
          >
            <MdClear className={classes.delIconPic} />
          </IconButton>
          <Popover
            id={delId}
            open={delConfirmOpen}
            anchorEl={delConfirmAnchorEl}
            onClose={handleDelConfirmationClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            PaperProps={{
              className: classes.delComfirmationPopover,
            }}
          >
            <Typography className={classes.delComfirmationText}>
              Do you want to delete the course
            </Typography>
            <Box display="flex">
              <Button
                style={{ width: "100%" }}
                className={classes.delComfirmationDel}
                onClick={() => handleCourseDelete(null)}
              >
                Yes
              </Button>
              <Button
                style={{ width: "100%" }}
                onClick={handleDelConfirmationClose}
              >
                No
              </Button>
            </Box>
          </Popover>
        </Box>
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
          <IconButton
            className={classes.expandIcon}
            onClick={() =>
              setCourseView({ name: courseModel.name, courseModel })
            }
          >
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
      <CardActions
        className={classes.cardAction}
        onClick={handleTimeExpandIconClick}
      >
        <Typography variant="body1" className={classes.activityHint}>
          {activities.length === 0 ? "Availability" : activities.join(", ")}
        </Typography>

        <IconButton
          className={
            `${classes.timeExpandIcon}` +
            (timePanelOpen ? ` ${classes.timeExpandIconOpen}` : "")
          }
          aria-expanded={timePanelOpen}
          aria-label="show more"
        >
          <ExpandMoreIcon className={classes.timeExpandIconPic} />
        </IconButton>
      </CardActions>
      <Collapse in={timePanelOpen} timeout="auto" unmountOnExit>
        <CardContent className={classes.timeCardContent}>
          {allMeetings}
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default CourseCard;
