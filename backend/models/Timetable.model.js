const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema(
  {
    session: String,
    school: String,
    tId: {
      type: String,
      reuiqres: true,
    },
    timetable: {
      type: String,
      requires: true,
    },
  },
  { collection: "timetableSaved" }
);

const Timetable = mongoose.model("Timetable", TimetableSchema);

module.exports = Timetable;
