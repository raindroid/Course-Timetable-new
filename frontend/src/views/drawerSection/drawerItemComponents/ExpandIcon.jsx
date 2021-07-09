import { makeStyles } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { FaAngleRight } from "react-icons/fa";

const useStyle = makeStyles((theme) => ({
  expandIcon: {
    display: "flex",
    minWidth: 24,
    margin: "0",
    padding: "0",
  },
  expandIconPic: {
    width: 16,
    height: 16,
    padding: 2,
    transition: "background .3s linear, all .35s ease-in-out",
    transform: "0",
  },
  expandIconPicExpanded: {
    transform: "rotate(90deg)",
  },
}));

function ExpandIcon(props) {
  const classes = useStyle(props);
  const { expanded, iconColor } = props;

  return (
    <div className={classes.expandIcon}>
      <FaAngleRight
        style={{ color: iconColor }}
        className={
          classes.expandIconPic +
          (expanded ? ` ${classes.expandIconPicExpanded}` : "")
        }
      />
    </div>
  );
}

export default ExpandIcon;
