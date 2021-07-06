import { CourseModel } from "../models/CourseModel";
import { getRandomColor } from "../tools/colors";
import { getCourseManager } from "./CourseManager";

class CourseController {
  constructor() {
    this.course = {};
    this.updater = [];

    this.states = {
      disabled: false,
    };
  }

  bindCourse(course) {
    this.course = course;
    return this;
  }

  initCourse(course) {
    this.course = new CourseModel(course);
    return this;
  }

  bindCourseManager(timetableIndex) {
    this.timetableIndex = timetableIndex;
    return this;
  }

  initCourseFromString(s) {
    this.course = new CourseModel(JSON.parse(s));
    return this;
  }

  addUpdater(counter) {
    this.updater.push(counter);
  }

  removeUpdater(counter) {
    this.updater = this.updater.filter((c) => c !== counter);
  }

  forceUpdate() {
    for (const updater of this.updater) {
      updater();
    }
  }

  setDisable(disable = true) {
    if (this.states.disabled !== disable) {
      this.states.disabled = disable;
      this.forceUpdate();
    }
  }

  setCourseColor(color) {
    getCourseManager().getTimetable(this.timetableIndex).courses[
      this.course.name
    ].color = color;
    this.course.color = color;
    this.forceUpdate();
  }

  getCourseColor() {
    let color = getCourseManager().getTimetable(this.timetableIndex).courses[
      this.course.name
    ].color;
    if (!color) {
      color = getRandomColor("200");
      getCourseManager().getTimetable(this.timetableIndex).courses[
        this.course.name
      ].color = color;
    }
    this.course.color = color;
    return color;
  }

  setSelectedActivity(picked) {
    const selected = getCourseManager().getTimetable(this.timetableIndex)
      .courses[this.course.name].selected;
    let updated = false;
    for (const type in picked) {
      if (selected[type] !== picked[type]) {
        selected[type] = picked[type];
      } else {
        selected[type] = "";
      }
      updated = true;
    }
    if (updated) {
      this.forceUpdate();
    }
  }

  getSelectedActivity(type = null) {
    if (!getCourseManager().getTimetable(this.timetableIndex)) return {};
    const selected = getCourseManager().getTimetable(this.timetableIndex)
      .courses[this.course.name].selected;
    if (!type) return selected;
    return selected[type];
  }

  delete() {
    console.log("Remove course", this.course.name);
    if (!getCourseManager().getTimetable(this.timetableIndex)) return {};
    // remove course scheduling info
    const courses = getCourseManager().getTimetable(
      this.timetableIndex
    ).courses;
    delete courses[this.course.name];
    console.log(
      "removed course",
      getCourseManager().getTimetable(this.timetableIndex).courses
    );

    // remove course controller
    delete getCourseManager().courseControllers[this.timetableIndex]
      .controllers[this.course.name];

    // remove references to avoid memory leak
    delete this.course;

    // force courselist update
    getCourseManager().forceUpdate();
  }
}

export { CourseController };
