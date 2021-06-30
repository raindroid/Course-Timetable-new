import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import MainDrawerView from "./views/drawerSection/MainDrawerView";
import {
  createMuiTheme,
  CssBaseline,
  MuiThemeProvider,
} from "@material-ui/core";
import MainHeaderView from "./views/headerSection/MainHeaderView";
import MainContentView from "./views/contentSection/MainContentView";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import React, {
  Component,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

const initialDrawerWidth = 240;

const theme = createMuiTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  palette: {
    primary: {
      light: "#ECFDFD",
      main: "#BFDCEC",
      dark: "#779CCD",
      contrastText: "#000",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
}));

function App() {
  const classes = useStyles();
  const [drawerWidth, setDrawerWidth] = useState(initialDrawerWidth);
  const [tempDrawerWidth, setTempDrawerWidth] = useState(initialDrawerWidth);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  return (
    <Router>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <div className={classes.root}>
          <MainHeaderView
            drawerWidth={drawerWidth}
            setDrawerWidth={setDrawerWidth}
            tempDrawerWidth={tempDrawerWidth}
            setTempDrawerWidth={setTempDrawerWidth}
            mobileDrawerOpen={mobileDrawerOpen}
            setMobileDrawerOpen={setMobileDrawerOpen}
          />
          <MainDrawerView
            drawerWidth={drawerWidth}
            setDrawerWidth={setDrawerWidth}
            tempDrawerWidth={tempDrawerWidth}
            setTempDrawerWidth={setTempDrawerWidth}
            mobileDrawerOpen={mobileDrawerOpen}
            setMobileDrawerOpen={setMobileDrawerOpen}
          />
          <MainContentView drawerWidth={drawerWidth} />
        </div>
      </MuiThemeProvider>
    </Router>
  );
}

export default App;
