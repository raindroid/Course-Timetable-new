import { CssBaseline, Grid } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { CourseController } from "../../controllers/CourseController";
import { CourseModel } from "../../models/CourseModel";
import ECE344 from "../../models/examples/ECE344";
import useWindowDimensions from "../../tools/useWindowDimensions";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CourseCard from "./CourseCard";

const ECE344Controller = new CourseController().initCourse(ECE344);

const useStyles = makeStyles((theme) => ({
  courseListRoot: {
    borderRadius: 8,
    border: "1px #8884 solid",
  },
}));

function CourseList(props) {
  const { drawerWidth } = props;
  const classes = useStyles(props);
  const { height, width } = useWindowDimensions();
  const smSize = Math.ceil(
    12 / Math.floor((width - 16 - 8 - drawerWidth) / 215)
  );
  const cardSize = 5;
  const cardWidth = Math.floor(
    (width - 16 - 8 - drawerWidth) / Math.min(cardSize, 12 / smSize) - 16
  ); 

  return (
    <div>
      <CssBaseline />
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        className={classes.courseListRoot}
      >
        <Grid item xs={12} sm={smSize} style={{ maxWidth: "100%" }}>
          <CourseCard
            courseController={ECE344Controller}
            cardWidth={cardWidth}
          />
        </Grid>
        <Grid item xs={12} sm={smSize} style={{ maxWidth: "100%" }}>
          <CourseCard
            courseController={ECE344Controller}
            cardWidth={cardWidth}
          />
        </Grid>
        <Grid item xs={12} sm={smSize} style={{ maxWidth: "100%" }}>
          <CourseCard
            courseController={ECE344Controller}
            cardWidth={cardWidth}
          />
        </Grid>
        <Grid item xs={12} sm={smSize} style={{ maxWidth: "100%" }}>
          <CourseCard
            courseController={ECE344Controller}
            cardWidth={cardWidth}
          />
        </Grid>
        <Grid item xs={12} sm={smSize} style={{ maxWidth: "100%" }}>
          <CourseCard
            courseController={ECE344Controller}
            cardWidth={cardWidth}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default CourseList;
