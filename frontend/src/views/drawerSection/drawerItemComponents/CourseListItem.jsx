import {
  Chip,
  ListItem,
  makeStyles,
  Typography,
  Divider,
  Tooltip,
  useTheme,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa";
import ExpandIcon from "./ExpandIcon";
import "../../../App.css";
import { getCourseManager } from "../../../controllers/CourseManager";
import { useForceUpdate } from "../../../tools/useForceUpdate";

const useStyle = makeStyles((theme) => ({
  root: {},
  listRoot: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 2,
    paddingLeft: 24,
  },
  selectedCoruse: {
    fontSize: "0.77rem",
    paddingLeft: 40,
    display: "inline-block",
    padding: 0,
    margin: 0,
  },
  selectedCoruseActivity: {
    paddingRight: "0.5rem",
    fontFamily: "'Montserrat', sans-serif",
  },
  meetingOptionDivider: {
    margin: 1,
    paddRight: 16,
  },
  meeitngOption: {
    padding: 0,
    margin: "2px",
    minHeight: 0,
    fontSize: "0.72rem",
  },
  meeitngOptions: {
    marginLeft: 32,
    paddingLeft: 8,
    borderLeft: "2px solid white",
    width: "calc(100% - 48px)",
  },
}));

const dayNames = ["Online", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function CourseListItem(props) {
  const classes = useStyle(props);
  const theme = useTheme()
  const { termName, courseName, courseSelected, timetableIndex } = props;
  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const selectedMeetings = Object.entries(courseSelected.selected).map(
    ([type, meeting], index) => meeting
  );
  const selectedMeetingSet = new Set(selectedMeetings);
  const selectedList = selectedMeetings.map((meeting) => (
    <span key={meeting} className={classes.selectedCoruseActivity}>
      {meeting}
    </span>
  ));

  const controller = getCourseManager().getCourseContronller(
    timetableIndex,
    courseName
  );

  const courseColor = controller ? controller.getCourseColor() : "grey";

  // add updater to controller
  const forceupdate = useForceUpdate();
  useEffect(() => {
    controller.addUpdater(forceupdate);
    return () => {
      controller.removeUpdater(forceupdate);
    };
  }, []);

  const meetingOptions = [];
  const meetingOptionChips = [];
  if (controller) {
    for (const meetings of controller.course.meetings) {
      const type = meetings.meetingType;
      meetingOptions.push(
        ...meetings.activities.map((meeting) => {
          let meetingTimes = meeting.detail.map(
            (detail) =>
              `${dayNames[detail.meetingDay]} ${detail.meetingStartTime}~${
                detail.meetingEndTime
              }`
          );
          return { type, name: meeting.meetingName, meetingTimes };
        })
      );
    }

    const handleActivitySelect = (type, activityName) => {
      controller.setSelectedActivity({ [type]: activityName });
    };
    let type = meetingOptions.length > 0 && meetingOptions[0].type;
    for (const meeting of meetingOptions) {
      console.log(meeting);
      if (type !== meeting.type)
        meetingOptionChips.push(
          <Divider
            className={classes.meetingOptionDivider}
            key={meeting.type}
          />
        );
      type = meeting.type;
      meetingOptionChips.push(
        <Tooltip
          title={meeting.meetingTimes.map((element) => (
            <div>
              {element}
              <br />
            </div>
          ))}
          arrow
        >
          <Chip
            key={meeting.name}
            className={classes.meeitngOption}
            label={meeting.name}
            variant={
              selectedMeetingSet.has(meeting.name) ? "default" : "outlined"
            }
            onClick={() => handleActivitySelect(meeting.type, meeting.name)}
            size="small"
          />
        </Tooltip>
      );
    }
    console.log(meetingOptions);
  }

  return (
    <div key={courseName}>
      <ListItem button className={classes.listRoot} onClick={handleExpandClick}>
        <ExpandIcon expanded={expanded} iconColor={expanded ? courseColor : theme.palette.text.primary} />
        <strong>{courseName}</strong>
      </ListItem>

      {!expanded ? (
        <Typography variat="body2" className={classes.selectedCoruse}>
          {selectedList}
        </Typography>
      ) : (
        <div
          className={classes.meeitngOptions}
          style={{ borderColor: courseColor }}
        >
          {meetingOptionChips}
        </div>
      )}
    </div>
  );
}

export default CourseListItem;
