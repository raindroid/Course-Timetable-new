import React, { Component, useState } from "react";
import { makeStyles, useTheme, fade } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import { MdAccountCircle, MdMoreHoriz, MdClear } from "react-icons/md";
import { CgDarkMode } from "react-icons/cg";
import { RiShareFill } from "react-icons/ri";
import { GoSettings } from "react-icons/go";
import { Box, Divider, Hidden, TextField } from "@material-ui/core";
import { getCourseManager } from "../../controllers/CourseManager";
import { useForceUpdate } from "../../tools/useForceUpdate";
import Paper from "@material-ui/core/Paper";
import { useQuery } from "@apollo/client";
import { courseKeywordListQuery } from "../../controllers/queries";
import { Skeleton } from "@material-ui/lab";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Grid from "@material-ui/core/Grid";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import { MdCheckBox, MdAddBox } from "react-icons/md";
import { FaExpandAlt } from "react-icons/fa";
import "../../App.css";

const useStyles = makeStyles((theme) => ({
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: (props) => `calc(100% - ${props.drawerWidth}px)`,
      marginLeft: (props) => props.drawerWidth,
      transition: "width .24s linear",
    },
    minHeight: "48px",
    boxShadow: "none",
    background: "none",
    color: theme.palette.text.primary,
    paddingLeft: 0,
    transition: "background .24s ease-in-out",
  },
  toolBar: {
    minHeight: "48px",
    background: theme.palette.background.default,
    [theme.breakpoints.up("sm")]: {
      paddingLeft: (props) => (props.drawerWidth >= 48 ? 24 : 0),
    },
    transition: "background .24s ease-in-out",
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: (props) => (props.drawerWidth >= 48 ? "none" : "inherit"),
      visibility: "hidden",
    },
  },
  grow: {
    flexGrow: 1,
  },
  timetableName: {},
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 1),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    left: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchRightIcon: {
    display: "flex",
    minWidth: "20px",
    margin: "0",
    padding: "2px",
    borderRadius: "2px",
    "&:hover": {
      background: "none",
    },
  },
  searchRightIconPic: {
    width: "28px",
    height: "28px",
    borderRadius: "4px",
    padding: "6px",
    transition: "background .3s linear",
    "&:hover": {
      background: theme.palette.buttonHover,
    },
    "&:active": {
      background: `${theme.palette.action.active}8`,
    },
  },
  searchBar: {
    position: "relative",
    borderRadius: "2px",
    background: theme.palette.type === "dark" ? "#424242" : "#F3F6F5",
    borderBottom: "2px solid #AAAAFA88",
    left: 0,
    right: 0,
    top: 0,
    height: 38,
    margin: "8px",
    marginTop: "4px",
    paddingRight: "8px",
    zIndex: 1,
    transition:
      "background .3s linear, border .15s linear, all .24s ease-in-out",
    "&:hover": {
      background: theme.palette.type === "dark" ? "#4a4a4a" : "#FDFEFF",
      borderBottom: "2px solid #AAAAFAAA",
      borderRadius: "0",
    },
    display: "flex",
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    flexGrow: 1,
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  topIcon: {
    display: "flex",
    minWidth: "32px",
    margin: "0",
    padding: "2px",
    borderRadius: "2px",
    "&:hover": {
      background: "none",
    },
  },
  topIconPic: {
    width: "32px",
    height: "32px",
    borderRadius: "4px",
    padding: "6px",
    transition: "background .3s linear",
    "&:hover": {
      background: theme.palette.buttonHover,
    },
    "&:active": {
      background: `${theme.palette.action.active}8`,
    },
  },

  searchPaper: {
    transition: "all .3s linear",
    width: "auto",
    minWidth: "200px",
    maxWidth: "1200px",
    position: "absolute",
    borderRadius: "8px",
    background: theme.palette.type === "dark" ? "#21212166" : "#E6EEE766",
    border: "2px solid #AAAAFA11",
    top: 90,
    left: 0,
    right: 0,
    height: "fit-content",
    maxHeight: "calc(99vh - 90px)",
    minHeight: "40vh",
    magin: "16px auto",
    marginTop: 0,
    padding: "6px",
    zIndex: 1,
    display: "flex",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    [theme.breakpoints.up("sm")]: {
      margin: "24px",
      marginTop: 0,
      padding: "12px",
    },
  },
  searchPaperClose: {
    zIndex: -1,
    opacity: 1,
    top: "-100vh",
    height: 0,
    backdropFilter: "blur(1px)",
    WebkitBackdropFilter: "blur(1px)",
    display: "none",
  },
  lineSkeleton: {
    width: "80%",
    height: "1.2rem",
    margin: "0 auto",
  },
  searchResList: {
    width: "100%",
    padding: "0",
    maxHeight: "100%",
    overflow: "auto",
  },
  searchResListItem: {
    width: "100%",
    padding: "2px",
  },
  addIcon: {
    display: "flex",
    minWidth: "32px",
    margin: "0",
    padding: "2px",
    borderRadius: "2px",
    "&:hover": {
      background: "none",
    },
  },
  addIconPic: {
    width: "28px",
    height: "28px",
    borderRadius: "4px",
    padding: "4px",
    transition: "background .3s linear, all .4s ease-in-out",
    position: "absolute",
    "&:hover": {
      background: "#EEE2",
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
    transition: "background .3s linear, all .4s ease-in-out",
    "&:hover": {
      background: "#EEE2",
    },
  },

  searchResText: {
    width: "calc(100% - 70px)",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: "0.67rem",
    [theme.breakpoints.up("sm")]: {
      fontSize: "0.8rem",
    },
  },
  link: {
    color: theme.palette.type === "dark" ? "#eef" : "#110",
  },
}));

function MainHeaderView(props) {
  const classes = useStyles(props);
  const theme = useTheme();

  const { mobileDrawerOpen, setMobileDrawerOpen } = props;
  const { setTopBarHeight } = props;
  const { timetableIndex, setTimetableIndex } = props;
  const { prefersSystemDarkMode, setPrefersSystemDarkMode } = props;
  const { appForceUpdate } = props;
  const [searchBarOpen, setSearchBarOpen] = useState(false); // Testing
  const [filterOpen, setFilterOpen] = useState(false);
  const [onChangeName, setOnChangeName] = useState(false);

  const courseManager = getCourseManager();

  const handleToggleDarkMode = () => {
    setPrefersSystemDarkMode(!prefersSystemDarkMode);
  };

  const handleToggleSearchBar = () => {
    setSearchBarOpen(!searchBarOpen);
    if (!searchBarOpen) setTopBarHeight(48 + 38);
    else setTopBarHeight(48);
  };

  const handleToggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleChnageName = () => {
    setOnChangeName(!onChangeName);
  };

  const handleNameChanges = (e) => {
    const newName = (e.target.value && e.target.value.trim()) || "";
    if (
      newName.length > 0 &&
      newName !== courseManager.getTimetable(timetableIndex).displayName
    ) {
      courseManager.getTimetable(timetableIndex).displayName = newName;
      appForceUpdate();
    }
  };
  const handleNameKeyPressed = (e) => {
    if (e.keyCode === 13) handleChnageName();
  };

  // search related
  const [keyword, setKeyword] = useState("");
  const handleSearchFieldChange = (e) => {
    const content = e.target.value ? e.target.value.trim() : "";
    setKeyword(content);
  };
  const { loading, error, data } = useQuery(courseKeywordListQuery, {
    variables: { keyword: keyword, sectionLength: keyword ? 100 : 0 },
  });

  let courseList = [];
  let totalSize = 0;
  let returnSize = 0;

  if (data && data.getCoursesByKeyword && data.getCoursesByKeyword.courses) {
    courseList = data.getCoursesByKeyword.courses;
    totalSize = data.getCoursesByKeyword.totalLength;
    returnSize = data.getCoursesByKeyword.resultLength;
  }
  if (error) console.log(error);

  const loadingBars = [];
  for (let i = 0; i < 7; i++)
    loadingBars.push(
      <Skeleton animation="wave" key={i} className={classes.lineSkeleton} />
    );
  const loadingBar = (
    <Box
      display="flex"
      flexDirection="column"
      style={{ width: "100%", alignItems: "center" }}
    >
      {loadingBars}
    </Box>
  );

  // handle result selections
  const { setCourseView } = props;
  const handleResultExpand = async (courseName) => {
    const courseModel = await courseManager.addCourse(courseName);
    setCourseView({ courseModel, zIndex: 1300 });
  };
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
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolBar}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleMobileDrawerToggle}
          className={classes.menuButton}
        >
          <MenuIcon />
        </IconButton>
        <div className={classes.grow}>
          {(!onChangeName && (
            <div>
              <Typography
                variant="h6"
                noWrap
                component="h2"
                onClick={handleChnageName}
              >
                {courseManager.getTimetable(timetableIndex).displayName}
              </Typography>
            </div>
          )) || (
            <TextField
              id="newTimetableName"
              label="Timetable Name"
              defaultValue={
                courseManager.getTimetable(timetableIndex).displayName
              }
              variant="standard"
              fullWidth={true}
              autoFocus={true}
              className={classes.timetableName}
              onChange={handleNameChanges}
              onKeyDown={handleNameKeyPressed}
              onBlur={handleChnageName}
            />
          )}
        </div>
        {/* <div className={classes.grow} /> */}
        <IconButton
          onClick={handleToggleSearchBar}
          aria-label="share"
          color="inherit"
          className={classes.topIcon}
        >
          <SearchIcon
            className={classes.topIconPic}
            style={
              searchBarOpen
                ? { background: `${theme.palette.action.active}8` }
                : {}
            }
          />
        </IconButton>

        <IconButton
          aria-label="share"
          color="inherit"
          className={classes.topIcon}
        >
          <RiShareFill className={classes.topIconPic} />
        </IconButton>
        <IconButton
          aria-label="share"
          color="inherit"
          className={classes.topIcon}
          onClick={handleToggleDarkMode}
        >
          <CgDarkMode className={classes.topIconPic} />
        </IconButton>
        <IconButton
          aria-label="share"
          color="inherit"
          className={classes.topIcon}
        >
          <MdMoreHoriz className={classes.topIconPic} />
        </IconButton>
      </Toolbar>
      <div
        className={classes.searchBar}
        style={
          searchBarOpen ? {} : { opacity: "0%", marginTop: "-40px", zIndex: -1 }
        }
      >
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder="Search Course …"
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          value={keyword}
          inputProps={{ "aria-label": "search" }}
          onChange={handleSearchFieldChange}
        />
        <IconButton
          aria-label="share"
          color="inherit"
          className={classes.searchRightIcon}
          onClick={() => setKeyword("")}
        >
          <MdClear className={classes.searchRightIconPic} />
        </IconButton>
        <IconButton
          aria-label="share"
          color="inherit"
          className={classes.searchRightIcon}
          onClick={handleToggleFilter}
        >
          <GoSettings
            className={classes.searchRightIconPic}
            style={
              filterOpen
                ? { background: `${theme.palette.action.active}8` }
                : {}
            }
          />
        </IconButton>
      </div>
      <Paper
        variant="outlined"
        className={
          classes.searchPaper +
          (!(searchBarOpen && keyword) ? ` ${classes.searchPaperClose}` : "")
        }
      >
        {loading ? (
          loadingBar
        ) : error ? (
          "Network error"
        ) : !courseList || courseList.length === 0 ? (
          "Nothing found"
        ) : (
          <List dense={true} className={classes.searchResList}>
            <ListItem
              className={classes.searchResListItem}
              style={{ color: "grey", fontSize: "0.7rem" }}
              key={-1}
            >
              <Box
                display="flex"
                justify="space-between"
                alignItems="center"
                width="100%"
              >
                <Box flexGrow={1}>
                  {totalSize === returnSize
                    ? `Found total ${totalSize} result` + (totalSize > 1 && "s")
                    : `Only show first ${returnSize} results`}
                </Box>
                <div>
                  <MdAddBox />
                  &nbsp; Add course, and then pick sections
                </div>
              </Box>
            </ListItem>
            {courseList.map((course, index) => {
              return (
                <div key={index}>
                  <Divider></Divider>
                  <ListItem className={classes.searchResListItem}>
                    <Box
                      display="flex"
                      justify="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      <Box flexGrow={1} className={classes.searchResText}>
                        <a
                          href={course.courseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={classes.link}
                        >
                          {course.courseName}
                        </a>
                        &nbsp; - <strong>{course.courseTitle}</strong>
                        {course.orgName && ` (${course.orgName})`}
                      </Box>
                      <Box display="flex">
                        <IconButton
                          className={classes.expandIcon}
                          onClick={() => handleResultExpand(course.courseName)}
                        >
                          <FaExpandAlt className={classes.expandIconPic} />
                        </IconButton>
                        <IconButton
                          className={classes.addIcon}
                          onClick={() => handleResultAdd(course.courseName)}
                        >
                          <MdAddBox
                            className={
                              classes.addIconPic +
                              (courseManager.getCourseContronller(
                                timetableIndex,
                                course.courseName
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
                                course.courseName
                              )
                                ? " iconFront"
                                : " iconBack")
                            }
                          />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                </div>
              );
            })}
          </List>
        )}
      </Paper>
    </AppBar>
  );
}

export default MainHeaderView;
