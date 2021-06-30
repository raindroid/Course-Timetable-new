import React, { Component } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: (props) => `calc(100% - ${props.drawerWidth}px)`,
      marginLeft: (props) => props.drawerWidth,
      transition: "width .24s linear",
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
}));

function MainHeaderView(props) {
  const classes = useStyles(props);
  const theme = useTheme();

  const { mobileDrawerOpen, setMobileDrawerOpen } = props;

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };
  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleMobileDrawerToggle}
          className={classes.menuButton}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap>
          Responsive drawer
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default MainHeaderView;
