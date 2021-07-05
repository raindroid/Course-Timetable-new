import ECE344 from "../models/examples/ECE344";

class CourseManager {
    constructor() {
        console.log("Loading timetables")
        // try to recover anything we left last time (in the local storage)
        this.timetables = localStorage.getItem('timetables');
        this.courses = {}
    }
    verify() {
        console.log(this.timetables)
        if (this.timetables) this.timetables = {}
        else {

        }
    }
    queryCourse(course) {
        return ECE344
    }
}

const courseManager = new CourseManager()
const getCourseManager = () => {
    return courseManager
}

export {
    getCourseManager
}