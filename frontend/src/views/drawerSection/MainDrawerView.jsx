import React, {
  Component,
  useEffect,
  useState,
  useRef,
  useCallback,
  createRef,
} from "react";
import PropTypes from "prop-types";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MailIcon from "@material-ui/icons/Mail";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import withWidth, { isWidthUp, isWidthDown } from "@material-ui/core/withWidth";

import { FaBook, FaArrowCircleLeft, FaBars } from "react-icons/fa";
import {
  BsThreeDots,
  BsArrowBarRight,
  BsArrowBarLeft,
  BsPlus,
} from "react-icons/bs";
import { BiTable } from "react-icons/bi";

import {
  Grid,
  Grow,
  IconButton,
  Paper,
  Popper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  LinearProgress,
  Button,
  TextField,
} from "@material-ui/core";
// import {ReactComponent as Logo} from "../../logo.svg";
import logo from "../../logo.svg";
import { getCourseManager } from "../../controllers/CourseManager";
import useStateCallback from "../../tools/useStateCallback";
import { useForceUpdate } from "../../tools/useForceUpdate";
import TermListItem from "./drawerItemComponents/TermListItem";

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: (props) => props.drawerWidth,
      flexShrink: 0,
      transition: "width .24s linear",
      zIndex: "1200",
    },
  },
  titleLogo: {
    width: "20px",
    height: "20px",
  },
  titleItem: {
    margin: "0",
    padding: theme.spacing(2),
    paddingTop: "10px",
    paddingBottom: "8px",
  },
  titleRightIcon: {
    minWidth: "20px",
    margin: "0",
    position: "absolute",
    right: theme.spacing(1),
    borderRadius: "4px",
    padding: "6px",
    transition: "background .24s linear",
    "&:hover": {
      background: "#DDD4",
    },
    "&:active": {
      background: "#CCC4",
    },
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  listItem: {
    margin: "0",
    padding: theme.spacing(2),
    paddingTop: "0px",
    paddingBottom: "0px",
    transition: "background .16s linear",
    "&:active": {
      background: "#DDD3",
    },
  },
  selectedListItem: {
    background: theme.palette.type === "dark" ? "#323234" : "#d5d5d5",
  },
  listRightIcon: {
    minWidth: "24px",
    width: "25px",
    height: "25px",
    margin: "0",
    padding: "5px",
    position: "absolute",
    right: theme.spacing(1),
    borderRadius: "4px",
    transition: "background .24s linear",
    "&:hover": {
      background: "#DDD4",
    },
    "&:active": {
      background: "#CCC4",
    },
  },
  listRightIconPic: {
    width: "16px",
    height: "16px",
  },
  floatingPanel: {
    position: "fixed",
    top: "48px",
    left: theme.spacing(1),
    width: 240,
    transition: "width .24s linear, left .4s ease-in-out",
    border: "rgba(0,0,0,0.16) 1px solid",
    borderRadius: "3px",
  },
  cornerIcon: {
    minWidth: "32px",
    width: "32px",
    height: "32px",
    margin: "0",
    padding: "5px",
    position: "fixed",
    top: theme.spacing(1),
    left: theme.spacing(1),
    borderRadius: "4px",
    transition: "background .24s linear",
    "&:hover": {
      background: "#DDD4",
    },
    "&:active": {
      background: "#CCC4",
    },
  },
  cornerIconPic: {
    width: "16px",
    height: "16px",
  },
  listIcon: {
    minWidth: "32px",
    padding: "0",
    margin: "0",
  },
  listIconPic: {
    width: "18px",
    height: "18px",
  },
  drawerPaper: {
    [theme.breakpoints.up("sm")]: {
      width: (props) => props.drawerWidth,
      maxWidth: "75vw",
    },
    maxWidth: "80vw",
    transition: "width .24s linear",
    borderRight: "rgba(0,0,0,0.01) 1px solid",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  dragger: {
    width: "5px",
    cursor: "ew-resize",
    padding: "4px 0 0",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: "100",
    transition: "background .32s ease-in-out",
    background: "#D5D5D500",
    "&:hover": {
      background: "#D5D5D5A0",
    },
  },
  timetableName: {},
  createTimetable: {
    background: "none",
    "&:hover": {
      background: "#DDD4",
    },
    "&:active": {
      background: "#CCC4",
    },
  },
}));

const minWidth = 200;
const maxWidth = 480;

function MainDrawerView(props) {
  const classes = useStyles(props);
  const theme = useTheme();
  const [isResizing, setIsResizing] = useState(false);
  const {
    mobileDrawerOpen,
    setMobileDrawerOpen,
    drawerOpen,
    setDrawerOpen,
    drawerWidth,
    setDrawerWidth,
    tempDrawerWidth,
    setTempDrawerWidth,
    getImage,
    image,
    timeManager,
    dataLoad,
  } = props;
  const { timetableIndex, setTimetableIndex, setCourseView } = props;
  const [mouseOnItem, setMouseOnItem] = useState("");
  const [floatingPanelOpen, setFloatingPanelOpen] = useState(false);

  const courseManager = getCourseManager();

  const handleToggleTimetableIndex = (index) => {
    setTimetableIndex(index);
    setCourseView("");
  };
  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleDrawerToggle = () => {
    if (!drawerOpen) {
      setDrawerWidth(tempDrawerWidth);
    } else {
      setTempDrawerWidth(drawerWidth);
      setDrawerWidth(0);
    }
    setDrawerOpen(!drawerOpen);
  };

  const handleResizeMouseDown = useCallback((event) => {
    setIsResizing(true);
    function handleMouseMove(e) {
      if (e.clientX > minWidth && e.clientX < maxWidth) {
        setDrawerWidth(e.clientX);
      }
    }
    function handleMouseUp() {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    if (event.stopPropagation) event.stopPropagation();
    if (event.preventDefault) event.preventDefault();
    event.cancelBubble = true;
    event.returnValue = false;
    return false;
  }, []);

  const handleListItemMouseEnter = (itemKey) => {
    return (e) => {
      setMouseOnItem(itemKey);
    };
  };

  const handleListItemMouseLeave = (itemKey) => {
    return (e) => {
      if (itemKey === mouseOnItem) setMouseOnItem();
    };
  };

  const handleFloatingButtonMouseEnter = (e) => {
    setFloatingPanelOpen(true);
    handleListItemMouseEnter("openDrawer")(e);
  };

  const handleFloatingButtonMouseLeave = (e) => {
    if (!(e.clientX < 48 && e.clientY > 40)) setFloatingPanelOpen(false);
    handleListItemMouseLeave("openDrawer")(e);
  };

  const handleFloatingPanelMouseLeave = (e) => {
    if (!(e.clientX < 48 && e.clientY < 60)) setFloatingPanelOpen(false);
  };

  // handle menu
  const [menuAchorEl, setMenuAchorEl] = useState(null);
  const [op, setOp] = useState(null);
  const [opIndex, setOpIndex] = useState(null);
  const handleMenuOpen = (index) => (e) => {
    setMenuAchorEl(e.currentTarget);
    setOpIndex(index);
    e.preventDefault();
    e.stopPropagation();
  };
  const handleMenuClose = (item) => {
    if (item) {
      setOp(item);
    }
    setMenuAchorEl(null);
  };

  useEffect(() => {
    const operation = async () => {
      if (op) {
        if (op === "duplicate" && typeof opIndex === "number") {
          const newIndex = await getCourseManager().duplicateTimetable(opIndex);

          setTimetableIndex(newIndex);
        } else if (op === "delete" && typeof opIndex === "number") {
          const newIndex = await getCourseManager().removeTimetable(opIndex);
          setTimetableIndex(newIndex);
        } else if (op === "create" && typeof opIndex === "string") {
          const newIndex = await getCourseManager().createTimetable(opIndex);
          setTimetableIndex(newIndex);
        }
        setOp(null);
      }
    };
    setTimeout(() => {
      operation();
    }, 100);
    return () => {};
  }, [op]);

  const menu = (
    <Popper
      open={Boolean(menuAchorEl)}
      anchorEl={menuAchorEl}
      role={undefined}
      transition
      disablePortal
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin:
              placement === "bottom" ? "center top" : "center bottom",
          }}
        >
          <Paper>
            <ClickAwayListener onClickAway={() => handleMenuClose(false)}>
              <MenuList autoFocusItem={Boolean(menuAchorEl)}>
                <MenuItem onClick={() => handleMenuClose("duplicate")}>
                  Duplicate
                </MenuItem>
                <MenuItem
                  onClick={() => handleMenuClose("delete")}
                  style={{ color: "red" }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );

  const infoList = (
    <List>
      {["Table List"].map((text, index) => (
        <ListItem button key={text} className={classes.listItem} disabled>
          <ListItemIcon className={classes.listIcon}>
            <FaBook className={classes.listIconPic} />
          </ListItemIcon>
          <ListItemText primary={text} />
        </ListItem>
      ))}
    </List>
  );

  // generate detailed table list
  const terms = getCourseManager().getTermNames();
  const termList = timeManager
    ? terms.map((termName, index) => (
        <TermListItem
          key={termName}
          termName={termName}
          timetableIndex={timetableIndex}
          dataLoad={dataLoad}
        />
      ))
    : [];

  // handle add new timetable
  const [newTimeTable, setNewTimeTable] = useState(false);
  const handleStartNewTimetable = () => {
    setNewTimeTable(true);
  };
  const handleFinishNewTimetable = (e) => {
    const name = (e.target.value && e.target.value.trim()) || false;
    setNewTimeTable(false);
    if (name) {
      setOpIndex(name);
      setOp("create");
    }
  };
  const handleNameKeyPressed = (e) => {
    if (e.keyCode === 13) handleFinishNewTimetable(e);
    if (e.key === "Escape") setNewTimeTable(false);
  };
  const tableList = (
    <List>
      {courseManager.timetables.map((timetable, index) => (
        <div key={`timetable-20211=${index}`}>
          <ListItem
            button
            key={`timetable-20211=${index}`}
            className={
              classes.listItem +
              (timetableIndex === index ? ` ${classes.selectedListItem}` : "")
            }
            onMouseEnter={handleListItemMouseEnter(`timetable-20211=${index}`)}
            onMouseLeave={handleListItemMouseLeave(`timetable-20211=${index}`)}
            onClick={() => handleToggleTimetableIndex(index)}
          >
            <ListItemIcon className={classes.listIcon}>
              <BiTable className={classes.listIconPic} />
            </ListItemIcon>
            <ListItemText primary={timetable.displayName} />
            <ListItemIcon
              className={classes.listRightIcon}
              onClick={handleMenuOpen(index)}
              style={
                `timetable-20211=${index}` === mouseOnItem ||
                "ontouchstart" in window ||
                Boolean(menuAchorEl)
                  ? { display: "block" }
                  : { display: "none" }
              }
            >
              <BsThreeDots className={classes.listRightIconPic} />
            </ListItemIcon>
          </ListItem>
          {index === timetableIndex && termList}
          <Divider />
        </div>
      ))}
      <ListItem
        button
        onClick={handleStartNewTimetable}
        className={classes.createTimetable}
      >
        {newTimeTable ? (
          <TextField
            label="New Timetable"
            variant="standard"
            fullWidth={true}
            autoFocus={true}
            className={classes.timetableName}
            onKeyDown={handleNameKeyPressed}
            onBlur={handleFinishNewTimetable}
          />
        ) : (
          <Box display="flex" justifyContent="flex-start" alignItems="center">
            <BsPlus /> &nbsp;Create new ...
          </Box>
        )}
      </ListItem>
    </List>
  );

  const floatingDrawer = (
    <div>
      {infoList}
      <Divider />
      {tableList}
    </div>
  );

  const drawer = (
    <div>
      <div
        alignitems="center"
        onMouseEnter={handleListItemMouseEnter("title")}
        onMouseLeave={handleListItemMouseLeave("title")}
        className={classes.titleItem}
        style={{ width: "100%", display: "flex", alignItems: "center" }}
      >
        <img
          src={logo}
          className={classes.titleLogo}
          alt="logo"
          display="inline"
        />
        <Typography
          display="inline"
          variant="h5"
          component="h1"
          className={classes.listItem}
          noWrap
        >
          Timetable
        </Typography>
        <IconButton
          display="inline"
          aria-label="hide"
          onClick={() => handleDrawerToggle(true)}
          style={
            "title" === mouseOnItem || "ontouchstart" in window
              ? {}
              : { display: "none" }
          }
          className={classes.titleRightIcon}
        >
          <BsArrowBarLeft className={classes.listRightIconPic} />
        </IconButton>
      </div>

      <Divider />
      {infoList}
      <Divider />
      {tableList}
      {menu}
      {op && <LinearProgress />}
    </div>
  );

  const dragger = (
    <div
      id="dragger"
      onMouseDown={handleResizeMouseDown}
      className={classes.dragger}
      style={isResizing ? { background: "#C5C5C5" } : {}}
    />
  );

  return (
    <nav className={classes.drawer} aria-label="mailbox folders">
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      <Hidden smUp implementation="css">
        <Drawer
          variant="temporary"
          anchor={theme.direction === "rtl" ? "right" : "left"}
          open={mobileDrawerOpen}
          onClose={handleMobileDrawerToggle}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
          {dragger}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="persistent"
          open={drawerOpen}
        >
          {drawer}
          {dragger}
        </Drawer>
        <div style={drawerOpen ? { display: "none" } : { display: "block" }}>
          <IconButton
            className={classes.cornerIcon}
            onClick={handleDrawerToggle}
            key="openDrawer"
            onMouseEnter={handleFloatingButtonMouseEnter}
            onMouseLeave={handleFloatingButtonMouseLeave}
          >
            {mouseOnItem === "openDrawer" ? (
              <BsArrowBarRight className={classes.cornerIconPic} />
            ) : (
              <FaBars className={classes.cornerIconPic} />
            )}
          </IconButton>
          <Paper
            className={classes.floatingPanel}
            style={floatingPanelOpen ? {} : { left: -280 }}
            onMouseLeave={handleFloatingPanelMouseLeave}
          >
            {floatingDrawer}
          </Paper>
        </div>
      </Hidden>
    </nav>
  );
}

export default MainDrawerView;
