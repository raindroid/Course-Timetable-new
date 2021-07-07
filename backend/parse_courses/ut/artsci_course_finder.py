import urllib.request
from typing import List
import re, os, json
from courseDB import CourseDB
from bs4 import BeautifulSoup
from pprint import pprint, pformat
from utils import get_page, change_keys, parse_day
import json
from utils import bcolors
from halo import Halo
from shared_course_web_ananlyzer import download_course_description_single_page
from string import ascii_lowercase


def download_artsci_course_description(url: str, db: CourseDB, col_name: str, exceptionKeys: dict={}, startIndex=0, courseUrl=None):
    spinner = Halo(text='Downloading UTSG ArtSci Course Description')
    spinner.start()
    count = 0
    if not '$page' in url:
        count = download_course_description_single_page(url, db, col_name, spinner=spinner, departmentHint="ArtSci", exceptionKeys=exceptionKeys, courseUrl=courseUrl)
    else:
        page_index = startIndex
        size = download_course_description_single_page(url.replace("$page", str(page_index)), db, col_name, spinner=spinner, departmentHint="ArtSci", exceptionKeys=exceptionKeys, courseUrl=courseUrl)
        total_size = size
        while size > 0:
            size = download_course_description_single_page(url.replace("$page", str(page_index)), db, col_name, spinner=spinner, departmentHint="ArtSci", exceptionKeys=exceptionKeys, courseUrl=courseUrl)
            total_size += size
            page_index += 1
        count = size
    spinner.stop()
    return count

def get_artsci_course_detail(courseHint: str, time:str="20219", save_file: str = '', save_file_ori: str = '', spinner=None):
    """
     The url is https://timetable.iit.artsci.utoronto.ca/
     API format /api/20199/courses?org=&code={course code}&section=&
                studyyear=&daytime=&weekday=&prof=&breadth=&online=&
                waitlist=&available=&title=
    :return:
    """
    if save_file != '':
        data_file = open(save_file, 'w')

    url = 'https://timetable.iit.artsci.utoronto.ca'
    api_url = f'/api/{time}/courses?org=&code={courseHint}&section=&studyyear=&daytime=&weekday=&' \
              'prof=&breadth=&online=&waitlist=&available=&title='

    page = get_page(url + api_url)
    if not page:
        # empty page found
        if spinner: spinner.fail(f'Nothing related to {courseHint} found')
        return

    try:
        data = json.loads(page)
    except:
        # page is not a json
        if spinner: spinner.fail(f'Nothing related to {courseHint} found')
        return

    if not data:
        # nothing useful found
        if spinner: spinner.fail(f'Nothing related to {courseHint} found')
        return

    if save_file_ori != '':
        ori_file = open(save_file_ori, 'w')
        ori_file.write(json.dumps(data))
        ori_file.close()

    if spinner: spinner.info('Num of courses: {}'.format(len(data)))

    all_courses = []
    for i, course in enumerate(data.keys()):

        def findCourseName(course: str) -> str:
            first_dash = course.find('-')
            if first_dash == -1: return course
            return course[:first_dash] + course[first_dash + 1]

        # set up course name
        course_name = findCourseName(course)
        if course_name[:len(courseHint)].lower() != courseHint.lower(): continue
        course_data = {'courseName': course_name}
        if spinner: spinner.succeed(f'Found Course: {course_name} - Progress {i + 1} of {len(data.keys())}')

        # set up course type
        course_data.update({'courseType': data[course]["section"]})

        # set up the meetings info
        try:
            meetings_data = data[course].pop('meetings')
        except:
            continue
        meetings_info = {}

        for meetingName, meeting_data in meetings_data.items():
            if "cancel" in meeting_data and isinstance(meeting_data['cancel'], str) and \
                    'CANCEL' in meeting_data['cancel'].upper():
                if spinner: spinner.fail('This Course is Cancelled')
                break

            # set up meeting instructors
            instructor_info = []
            instructor_list = meeting_data.pop('instructors')
            if instructor_list != []:
                for instructor_data in instructor_list.values():
                    instructor_info.append(instructor_data['firstName'] + ' ' + instructor_data['lastName'])

            # set up single meeting
            meeting_all = []
            for meeting_raw in meeting_data['schedule'].values():

                if meeting_raw['meetingDay']:
                    meeting_raw.update({'meetingDay': parse_day(meeting_raw['meetingDay'])})
                    meeting_all.append(meeting_raw)
            meeting_data.pop('schedule')

            meeting_type = meeting_data.pop('teachingMethod')
            if meeting_type in meetings_info:
                meetings_info[meeting_type].append({'meetingName': meetingName.replace('-', ''),
                                      'instructors': instructor_info,
                                      'detail': meeting_all})
            else:
                meetings_info.update({meeting_type: [{'meetingName': meetingName.replace('-', ''),
                                                    'instructors': instructor_info,
                                                    'detail': meeting_all}]})

            # replace human readable delivery mode
            meeting_mode = meeting_data.pop('online')  
            meeting_data['deliveryMode'] = meeting_mode

            # other info
            meetings_info[meeting_type][-1].update(meeting_data)


        if not meetings_info:
            if spinner: spinner.fail('This course is not available')
            continue

        meeting_info_list = []
        for meeting_type, meeting_activities in meetings_info.items():
            meeting_info_list.append({'meetingType': meeting_type, 'activities': meeting_activities})
        
        course_data.update({'meetings': meeting_info_list})

        # other info
        course_data.update(data[course])
        if save_file != '':
            data_file.write(json.dumps(course_data))
            data_file.close()
        all_courses.append(course_data)
    return all_courses


def download_artsci_table(db: CourseDB, col_name: str, time: str="20219", save_year_course: bool = True, drop_first: bool = True) -> str:
    spinner = Halo(text='Downloading UTSG ArtSci Course Description')
    spinner.start()
    if drop_first:
        db.drop_col(col_name)
    
    course_names = ascii_lowercase
    size = 0
    for index, courseName in enumerate(course_names):
        courseData = get_artsci_course_detail(courseName, time=time, spinner=spinner)
        if courseData:
            db.insert_many(col_name, courseData)
            size += len(courseData)

        spinner.succeed(f"[artsci] Download Course Detail - {courseName} - {bcolors.OKBLUE} Overall Progress {index + 1} of {len(course_names)}. Currently {size} courses parsed {(bcolors.OKGREEN + ' SUCCESS ' if courseData else bcolors.FAIL + ' FAILED ') + bcolors.ENDC}")
    spinner.stop()

def get_artsci_exception_dict() -> dict:
    excep = {
        "ANT311Y0": "",
        "ARH361H0": "",
        "ARH361Y0": "",
        "HIS357Y0": "No description",
        "PCJ363H1": "This course will not be offered in 2021-22",
        "SOC393Y0": ""
    }
    return excep

if __name__ == '__main__':
    dir_path = os.path.dirname(os.path.realpath(__file__))
    with open(f"{dir_path}/../../secrets.json") as f:
        data = json.load(f)
    db = CourseDB(data['dbname'], data['dbuser'], data['dbpwd'], useAuth=False)
    # artsci_course_test('../../data/as_course_list.json')
    # get_artsci_course_detail('APM441H1')
    spinner = Halo(text='Downloading UTSG ArtSci Course Description')
    spinner.start()
    pprint(get_artsci_course_detail('ent200h1', spinner=spinner))
    # get_artsci_course_detail('PSY202H1', '../../data/samples/PSY202H1.json')
    # get_artsci_course_detail('HIS310H1', '../../data/samples/HIS310H1.json')
    # get_artsci_course_detail('CSC104H1', '../../data/samples/CSC104H1.json', '../../data/samples/CSC104H1-ori.json')
    # (get_artsci_course_detail('a', spinner=spinner))
    spinner.stop()
    # download_artsci_table(db, 'test')
    # url = 'https://artsci.calendar.utoronto.ca/search-courses?course_keyword=&field_section_value=All&field_prerequisite_value=&field_breadth_requirements_value=All&field_distribution_requirements_value=All&page=$page'
    # courseUrl = "https://artsci.calendar.utoronto.ca/course/$course"
    # excep = get_artsci_exception_dict()
    # download_artsci_course_description(url, db, 'test_as', exceptionKeys=excep, startIndex=0, courseUrl=courseUrl)

    # download_artsci_table(db, "test-as")