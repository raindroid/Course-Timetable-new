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
import { RiShareFill } from "react-icons/ri";
import { GoSettings } from "react-icons/go";
import { Hidden } from "@material-ui/core";

const hightlightColor = "#D5D5D588";

const useStyles = makeStyles((theme) => ({
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: (props) => `calc(100% - ${props.drawerWidth}px)`,
      marginLeft: (props) => props.drawerWidth,
      transition: "width .24s linear",
    },
    minHeight: "48px",
    boxShadow: "none",
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    paddingLeft: 0,
  },
  toolBar: {
    minHeight: "48px",
    background: "none",
    [theme.breakpoints.up("sm")]: {
      paddingLeft: (props) => (props.drawerWidth >= 48 ? 24 : 0),
    },
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
      background: "#EEE6",
    },
    "&:active": {
      background: hightlightColor,
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
    margin: "8px",
    marginTop: "4px",
    paddingRight: "8px",
    zIndex: 1,
    transition: "background .3s linear, border .15s linear",
    "&:hover": {
      background: "#FDFEFF22",
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
      background: "#EEE6",
    },
    "&:active": {
      background: hightlightColor,
    },
  },
}));

function MainHeaderView(props) {
  const classes = useStyles(props);
  const theme = useTheme();

  const { mobileDrawerOpen, setMobileDrawerOpen } = props;
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleToggleSearchBar = () => {
    setSearchBarOpen(!searchBarOpen);
  };

  const handleToggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
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
        <Typography variant="h6" noWrap component="h2">
          Fall Timetable
        </Typography>
        <div className={classes.grow} />
        <IconButton
          onClick={handleToggleSearchBar}
          aria-label="share"
          color="inherit"
          className={classes.topIcon}
        >
          <SearchIcon
            className={classes.topIconPic}
            style={searchBarOpen ? { background: hightlightColor } : {}}
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
        >
          <MdAccountCircle className={classes.topIconPic} />
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
        style={searchBarOpen ? {} : { display: "none" }}
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
          inputProps={{ "aria-label": "search" }}
        />
        <IconButton
          aria-label="share"
          color="inherit"
          className={classes.searchRightIcon}
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
            style={filterOpen ? { background: hightlightColor } : {}}
          />
        </IconButton>
      </div>
    </AppBar>
  );
}

export default MainHeaderView;
