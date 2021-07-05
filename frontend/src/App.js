import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import MainDrawerView from "./views/drawerSection/MainDrawerView";
import {
  createMuiTheme,
  CssBaseline,
  MuiThemeProvider,
  useMediaQuery,
} from "@material-ui/core";
import MainHeaderView from "./views/headerSection/MainHeaderView";
import MainContentView from "./views/contentSection/MainContentView";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import withWidth, { isWidthUp, isWidthDown } from "@material-ui/core/withWidth";
import React, {
  Component,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { getCourseManager } from "./controllers/CourseManager";

const initialDrawerWidth = 240;
const initialTopBarHeight = 48;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  rootContent: {
    display: "flex",
    width: "100vw",
  },
}));

function App(props) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const classes = useStyles();
  const [drawerWidth, setDrawerWidth] = useState(initialDrawerWidth);
  const [tempDrawerWidth, setTempDrawerWidth] = useState(initialDrawerWidth);
  const [topBarHeight, setTopBarHeight] = useState(initialTopBarHeight)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  useEffect(() => {
    const courseManager = getCourseManager()
    courseManager.verify()
    return () => {
    }
  }, [])

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        props: {
          MuiButtonBase: {
            disableRipple: true,
          },
        },
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: {
            light: "#F3F6F5",
            main: "#BFDCEC",
            dark: "#424242",
            contrastText: "#111",
          },
          secondary: {
            light: "#ff7961",
            main: "#f44336",
            dark: "#ba000d",
            contrastText: "#000",
          },
          background: {
            paper: prefersDarkMode ? "#424242" : "#F3F6F5",
            default: prefersDarkMode ? "#333333" : "#FCFCFD",
          },
          buttonHover: prefersDarkMode ? "#EEEEEE66" : "#DDD6",
        },
      }),
    [prefersDarkMode]
  );
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
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            setTopBarHeight={setTopBarHeight}
          />
          <div className={classes.rootContent}>
            <MainDrawerView
              drawerWidth={drawerWidth}
              setDrawerWidth={setDrawerWidth}
              tempDrawerWidth={tempDrawerWidth}
              setTempDrawerWidth={setTempDrawerWidth}
              mobileDrawerOpen={mobileDrawerOpen}
              setMobileDrawerOpen={setMobileDrawerOpen}
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
            />
            <MainContentView
              drawerWidth={drawerWidth}
              mobileDrawerOpen={mobileDrawerOpen}
              topBarHeight={topBarHeight}
            />
          </div>
        </div>
      </MuiThemeProvider>
    </Router>
  );
}

export default App;
