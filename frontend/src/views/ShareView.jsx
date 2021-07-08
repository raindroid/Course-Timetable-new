import {
  Box,
  Divider,
  makeStyles,
  Typography,
  useTheme,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import { getTimetableQuery } from "../controllers/timetableQueries";
import { useQuery } from "@apollo/client";
import { getCourseManager } from "../controllers/CourseManager";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "block",
    position: "fixed",
    zIndex: 2000,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 48,
  },
  shade: {
    background: "#5557",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  cardRoot: {
    marginBottom: "10vh",
    background: theme.palette.type === "dark" ? "#3336" : "#fffa",
    padding: "1vw",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    minWidth: "50vw",
  },
}));

function ShareView(props) {
  let { id } = useParams();
  const classes = useStyles(props);
  const theme = useTheme();
  const { setTimetableIndex } = props;

  const { loading, error, data } = useQuery(getTimetableQuery, {
    variables: { id },
  });

  let timetable = null;
  if (data && data.getTimetable) {
    timetable = JSON.parse(data.getTimetable);
    console.log(timetable);
  }

  // handle button clicks
  let history = useHistory();
  const handleAddTimetable = async () => {
    if (data && !error) {
      const newIndex = await getCourseManager().openSharedTimetable(
        data.getTimetable
      );
      setTimetableIndex(newIndex);

      history.push("/");
    }
  };
  const handleCancelShare = () => {
    history.push("/");
  };

  return (
    <div className={classes.root}>
      <div className={classes.shade}>
        <Card className={classes.cardRoot}>
          <CardContent>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              Someone shared a timetable with you!
            </Typography>
            <Typography variant="h5" component="h4">
              Shared Timetable
            </Typography>
            <Typography className={classes.pos} color="textSecondary">
              {timetable && timetable.displayName}
            </Typography>
            {timetable && (
              <div>
                <Divider style={{ margin: 8 }} />
                {Object.entries(timetable.courses).map(
                  ([courseName, courseDetail], index) => {
                    return (
                      <Typography variant="body2" component="p">
                        <strong
                          style={{ color: courseDetail.color || "initial" }}
                        >
                          {courseName}
                        </strong>
                        <br />
                        {Object.entries(courseDetail.selected).map(
                          ([type, name]) => (
                            <div
                              style={{
                                marginLeft: "1rem",
                                display: "inline-block",
                              }}
                            >
                              {name}
                            </div>
                          )
                        )}
                      </Typography>
                    );
                  }
                )}
                <Divider style={{ margin: 8 }} />
              </div>
            )}
          </CardContent>
          <CardActions>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Button size="small" onClick={handleAddTimetable}>
                Open it!
              </Button>
              <Button size="small" onClick={handleCancelShare}>
                No thanks.
              </Button>
            </Box>
          </CardActions>
        </Card>
      </div>
    </div>
  );
}

export default ShareView;
