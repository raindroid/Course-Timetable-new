import { CourseModel } from "../models/CourseModel";

class CourseController {
  constructor() {
    this.course = null; // should not share the course model across multiple controllers
    this.updater = [];

    this.states = {
      disabled: false,
    };

    this.selected = {};
  }

  bindCourse(course) {
    this.course = course;
    return this;
  }

  initCourse(course) {
    this.course = new CourseModel(course);
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

  setSelectedActivity(picked) {
    let updated = false;
    for (const type in picked) {
      if (this.selected[type] !== picked[type]) {
        this.selected[type] = picked[type];
      } else {
        this.selected[type] = "";
      }
      updated = true;
    }
    if (updated) this.forceUpdate();
  }

  getSelectedActivity(type = null) {
    if (!type) return this.selected;
    return this.selected[type];
  }
}

export { CourseController };
