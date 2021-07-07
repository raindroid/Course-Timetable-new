import { getRandomColor } from "../tools/colors";

const Names = {
  term: {
    F: "Fall",
    S: "Winter",
    Y: "Year",
    U: "Unknown",
  },
  days: {
    small: ["OL", "Mon", "Tue", "Wed", "Thu", "Fri"],
  },
};
class CourseModel {
  constructor(course) {
    course = course || {};
    this.course = course;
    this.color = course.color || getRandomColor("200"); // default generated color

    this.name = course.courseName;
    this.code = this.name;
    this.title = course.courseTitle;
    this.organization = course.orgName || "";
    this.termType = (course.courseType || "").toUpperCase();
    this.termName =
      Names.term[(this.course.courseType || "U").toUpperCase()] || "Unknown";
    this.description = course.courseDescription;
    this.link = course.courseUrl;
    this.credit = course.courseCredit;
    this.hours = course.courseHours;
    this.AUs = course.courseAUs;

    this.meetings = course.meetings;

    if (course.courseBreadthRequirements)
      this.labels = [course.courseBreadthRequirements];
    else if (course.courseProgramTags)
      this.labels = course.courseProgramTags.split(";;");
  }

  getMeetingLists() {
    const mList = this.course.meetings.map((meeting, index) => {
      const type = meeting.meetingType;
      const activities = meeting.activities.map((activity, index) => {
        let instructor = activity.instructor;
        if (!instructor || instructor.length === 0 || instructor === "NONE")
          instructor = [
            ...new Set(
              activity.detail
                .map((d) => d.instructor)
                .filter((i) => i && i !== [] && i !== "NONE")
            ),
          ].join("; ");
        return {
          name: activity.meetingName,
          deliveryMode: activity.deliveryMode,
          time: [
            ...new Set(
              activity.detail
                ? activity.detail.map(
                    (detail) =>
                      `${Names.days.small[detail.meetingDay]} ${
                        detail.meetingStartTime
                      } ~ ${detail.meetingEndTime}`
                  )
                : []
            ),
          ],
          instructor,
        };
      });
      return { type, activities };
    });

    return mList;
  }
}

export { CourseModel };
