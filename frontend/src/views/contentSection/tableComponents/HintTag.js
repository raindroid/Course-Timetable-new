import { Box, makeStyles, Typography, Divider } from "@material-ui/core";
import "../../../App.css";

const useStyle = makeStyles((theme) => ({
  root: {
    position: "absolute",
    left: 10,
    right: 0,
    zIndex: 0,
    top: (props) =>
      props.timeRange
        ? (props.sTime - props.timeRange[0]) * 70 * props.hourBlockHeightRatio
        : 0,
    height: (props) =>
      props.timeRange
        ? (props.eTime - props.sTime) * 70 * props.hourBlockHeightRatio
        : 0,
    [theme.breakpoints.down("md")]: {
      left: 0,
      top: (props) =>
        props.timeRange
          ? (props.sTime - props.timeRange[0]) * 60 * props.hourBlockHeightRatio
          : 0,
      height: (props) =>
        props.timeRange
          ? (props.eTime - props.sTime) * 60 * props.hourBlockHeightRatio
          : 0,
    },
  },
  timeText: {
    fontFamily: "Encode Sans SC, sans-serif",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: theme.palette.type === "dark" ? "#aaa" : "#888",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.64rem",
    },
  },

  gapText: {
    fontSize: "1rem",
    fontFamily: "Encode Sans SC, sans-serif",
    minWidth: "0",
    color: theme.palette.type === "dark" ? "#ccc" : "#666",
    width: "fit-content",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8rem",
    },
  },
}));

function HintTag(props) {
  const classes = useStyle(props);
  const { first, sTime, eTime, timeRange, last } = props;
  return (
    <Box
      display="flex"
      justifyContent={first ? "flex-end" : "space-between"}
      flexDirection="column"
      className={classes.root}
    >
      {!first && (
        <Typography className={classes.timeText}>{sTime}:00</Typography>
      )}
      {!first && !last && (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Typography className={classes.gapText}>
            {eTime - sTime}h gap
          </Typography>
        </Box>
      )}
      {!last && (
        <Typography className={classes.timeText}>{eTime}:00</Typography>
      )}
    </Box>
  );
}

export default HintTag;
