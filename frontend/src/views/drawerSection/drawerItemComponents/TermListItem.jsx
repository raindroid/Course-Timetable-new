import { ListItem, makeStyles } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import "../../../App.css";
import { getCourseManager } from "../../../controllers/CourseManager";
import CourseListItem from "./CourseListItem";
import ExpandIcon from "./ExpandIcon";

const useStyle = makeStyles((theme) => ({
  itemRoot: {},
  listRoot: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 6,
    paddingLeft: 16,
  },
}));

function TermListItem(props) {
  const classes = useStyle(props);
  const { termName, timetableIndex, dataLoad } = props;

  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const courses = getCourseManager().timetables[timetableIndex].courses;
  const ourCourses =
    courses &&
    Object.entries(courses).filter(
      ([courseName, course]) => course.termName === termName
    );

  const courseItems = ourCourses.map((course) => (
    <CourseListItem
      key={course[0]}
      termName={termName}
      timetableIndex={timetableIndex}
      courseName={course[0]}
      courseSelected={course[1]}
    />
  ));

  return (
    <div>
      <ListItem button onClick={handleExpandClick} className={classes.listRoot}>
        <ExpandIcon expanded={expanded} />
        <div>
          <strong>{termName}</strong>
          <span style={{ fontSize: "0.8rem" }}>
            &nbsp;
            {courseItems && courseItems.length > 0
              ? ` ${courseItems && courseItems.length} ${
                  courseItems.length > 1 ? "courses" : "course"
                }`
              : " No course"}
          </span>
        </div>
      </ListItem>
      <div>{expanded && courseItems}</div>
    </div>
  );
}

export default TermListItem;
