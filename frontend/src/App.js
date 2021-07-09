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
import {
  useForceUpdate,
  useForceUpdateWithValue,
} from "./tools/useForceUpdate";
import { Skeleton } from "@material-ui/lab";
import CourseView from "./views/contentSection/CourseView";
import { ApolloProvider } from "@apollo/client";
import ShareView from "./views/ShareView";
import { useScreenshot } from "use-react-screenshot";

const initialDrawerWidth = 224;
const initialTopBarHeight = 48;
const initialTimetable = 0;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100vw",
  },
  rootContent: {
    display: "flex",
    width: "100vw",
  },
}));

function App(props) {
  const [prefersSystemDarkMode, setPrefersSystemDarkMode] = useState(true);
  const classes = useStyles();
  const [drawerWidth, setDrawerWidth] = useState(initialDrawerWidth);
  const [tempDrawerWidth, setTempDrawerWidth] = useState(initialDrawerWidth);
  const [topBarHeight, setTopBarHeight] = useState(initialTopBarHeight);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [timetableIndex, setTimetableIndex] = useState(initialTimetable);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dataLoad, setDataLoad] = useState(false);
  const [courseView, setCourseView] = useState("");

  // screen shot related
  const [image, takeScreenshot] = useScreenshot();
  const [tableRef, setTableRef] = useState(null);
  const getImage = () => {
    window.scrollTo(0, 0);
    takeScreenshot(tableRef);
  };

  const forceUpdate = useForceUpdate();

  const prefersDarkMode =
    prefersSystemDarkMode === useMediaQuery("(prefers-color-scheme: dark)");

  const courseManager = getCourseManager();

  useEffect(() => {
    setDataLoad(false);
    courseManager.verify().then(() => {
      setDataLoad(true);
    });
    setDrawerOpen(true);
    return () => {};
  }, [timetableIndex]);

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
      <ApolloProvider client={courseManager.client}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <div className={classes.root}>
            <Switch>
              <Route
                path="/share=:id"
                children={<ShareView setTimetableIndex={setTimetableIndex} />}
              />
            </Switch>
            <MainHeaderView
              courseView={courseView}
              setCourseView={setCourseView}
              drawerWidth={drawerWidth}
              setDrawerWidth={setDrawerWidth}
              tempDrawerWidth={tempDrawerWidth}
              setTempDrawerWidth={setTempDrawerWidth}
              mobileDrawerOpen={mobileDrawerOpen}
              setMobileDrawerOpen={setMobileDrawerOpen}
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
              setTopBarHeight={setTopBarHeight}
              timetableIndex={timetableIndex}
              setTimetableIndex={setTimetableIndex}
              prefersSystemDarkMode={prefersSystemDarkMode}
              setPrefersSystemDarkMode={setPrefersSystemDarkMode}
              appForceUpdate={forceUpdate}
              getImage={getImage}
              image={image}
            />
            <MainDrawerView
              drawerWidth={drawerWidth}
              setDrawerWidth={setDrawerWidth}
              tempDrawerWidth={tempDrawerWidth}
              setTempDrawerWidth={setTempDrawerWidth}
              mobileDrawerOpen={mobileDrawerOpen}
              setMobileDrawerOpen={setMobileDrawerOpen}
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
              timetableIndex={timetableIndex}
              setTimetableIndex={setTimetableIndex}
              setCourseView={setCourseView}
              getImage={getImage}
              image={image}
            />
            <MainContentView
              drawerWidth={drawerWidth}
              drawerOpen={drawerOpen}
              mobileDrawerOpen={mobileDrawerOpen}
              topBarHeight={topBarHeight}
              timetableIndex={timetableIndex}
              setTimetableIndex={setTimetableIndex}
              dataLoad={dataLoad}
              setCourseView={setCourseView}
              setTableRef={setTableRef}
            />
            <CourseView
              courseView={courseView}
              setCourseView={setCourseView}
              drawerWidth={drawerWidth}
              drawerOpen={drawerOpen}
              mobileDrawerOpen={mobileDrawerOpen}
              topBarHeight={topBarHeight}
              timetableIndex={timetableIndex}
              setTimetableIndex={setTimetableIndex}
              dataLoad={dataLoad}
              appForceUpdate={forceUpdate}
            />
          </div>
        </MuiThemeProvider>
      </ApolloProvider>
    </Router>
  );
}

export default App;
