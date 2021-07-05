import { getRandomColor } from "../tools/colors"

const Names = {
    term: {
        F: "Fall",
        S: "Winter",
        Y: "Year",
        U: "Unknown"
    }
}

class CourseModel {
    constructor(course) {
        course = course || {}
        this.course = course
        this.color = course.color || getRandomColor('200')

        this.organization = course.orgName || ""
        this.termType = course.termType || "U"
        this.termName = Names.term[(this.course.courseType || "U").toUpperCase()]
        this.name = course.courseName
        this.code = this.name
        this.title = course.courseTitle
        this.description = course.courseDescription
        this.link = course.courseUtl
        this.credit = course.courseCredit
        this.hours = course.courseHours
        this.AUs = course.courseAUs

        this.meetings = course.meetings
        
        if (course.courseBreadthRequirements) this.labels = [course.courseBreadthRequirements]
        else if (course.courseProgramTags) this.labels = course.courseProgramTags.split(";;")
    }
}

export {
    CourseModel
}