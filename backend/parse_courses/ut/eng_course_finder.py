import urllib.request
from typing import List
import re, os, json
from courseDB import CourseDB
from bs4 import BeautifulSoup
from pprint import pprint
from utils import get_page, change_keys, parse_day
from utils import bcolors
from halo import Halo
from shared_course_web_ananlyzer import download_course_description_single_page

def download_engineering_course_description(url: str, db: CourseDB, col_name: str, exceptionKeys: dict={}, startIndex=0, courseUrl=None):
    spinner = Halo(text='Downloading UTSG Engineering Course Description')
    spinner.start()
    count = 0
    if not '$page' in url:
        count = download_course_description_single_page(url, db, col_name, spinner=spinner, departmentHint="ENG", exceptionKeys=exceptionKeys, courseUrl=courseUrl)
    else:
        page_index = startIndex
        size = download_course_description_single_page(url.replace("$page", str(page_index)), db, col_name, spinner=spinner, departmentHint="ENG", exceptionKeys=exceptionKeys, courseUrl=courseUrl)
        total_size = size
        while size > 0:
            size = download_course_description_single_page(url.replace("$page", str(page_index)), db, col_name, spinner=spinner, departmentHint="ENG", exceptionKeys=exceptionKeys, courseUrl=courseUrl)
            total_size += size
            page_index += 1
        count = size
    spinner.stop()
    return count

def download_engineering_table(url: str, db: CourseDB, col_name: str, save_year_course: bool = True, drop_first: bool = True) -> str:
    spinner = Halo(text='Downloading UTSG Engineering Course Timetable')
    spinner.start()
    page = get_page(url)

    soup = BeautifulSoup(page, 'html.parser')
    course_groups_html = soup.find_all('table')[1:]

    course_table = []
    if drop_first:
        db.drop_col(col_name)

    for course_group_html in course_groups_html:
        course_headers = [tag.string for tag in course_group_html.tr.find_all('th')]
        
        all_courses = course_group_html.find_all('tr')[1:]
        for index, meeting_html in enumerate(all_courses):
            meeting_info = [info.string if info.string != '\xa0' else 'NONE' for info in meeting_html.find_all('font')]

            course_type = meeting_info[0][-1]
            course_name = meeting_info[0]

            if not save_year_course and course_type.capitalize() == 'Y':
                continue

            course_found = False
            detail_raw = {header: context for header, context in zip(course_headers[2:], meeting_info[2:])}
            detail_info = change_keys(detail_raw, {
                "START DATE": 'meetingStartDate',
                "DAY": 'meetingDay',
                "START": 'meetingStartTime',
                "FINISH": 'meetingEndTime',
                "LOCATION": 'meetingLocation',
                "PROFESSOR(S)": 'instructor',
                "SCHEDULING NOTES": 'notes',
                "DELIVERY MODE": 'deliveryMode'
            })
            deliveryMode = detail_info['deliveryMode'] if 'deliveryMode' in detail_info else "None"
            detail_info.update({'meetingDay': parse_day(detail_info['meetingDay'])})
            instructor = detail_info['instructor']
            meeting = {'meetingName': meeting_info[1],
                       'meetingType': meeting_info[1][:3],
                       'instructors': [] if instructor == 'NONE' else [instructor],
                       'deliveryMode': deliveryMode,
                       'detail': [detail_info]}
            meeting_type = meeting.pop('meetingType')

            # check for previous course name
            for previous_course in course_table:
                if previous_course['courseName'] == meeting_info[0]:

                    # check for previous meeting type first
                    meeting_type_found = False
                    for previous_meetings in previous_course['meetings']:
                        previous_meeting_type, meetings = previous_meetings['meetingType'], previous_meetings['activities']
                        if previous_meeting_type == meeting_type:

                            # check for previous meeting name
                            meeting_found = False
                            for previous_meeting in meetings:
                                if previous_meeting['meetingName'] == meeting['meetingName']:

                                    # update instructor list
                                    instructor_found = False
                                    for previous_instructor in previous_meeting['instructors']:
                                        if previous_instructor == meeting['instructors'][0]:
                                            instructor_found = True
                                            break
                                    if not instructor_found:
                                        previous_meeting['instructors'].extend(meeting['instructors'])

                                    previous_meeting['detail'].extend(meeting['detail'])
                                    meeting_found = True
                                    break

                            if not meeting_found:
                                # no previous meeting found
                                meetings.append(meeting)

                            meeting_type_found = True
                            break

                    if not meeting_type_found:
                        # add a new type
                        previous_course['meetings'].append({'meetingType': meeting_type, 'activities': [meeting]})

                    course_found = True
                    break

            if not course_found:
                # add a new course
                course_table.append({
                    'courseName': course_name,
                    'courseType': course_type,
                    'orgName': 'Engineering',
                    'meetings': [{'meetingType': meeting_type, 'activities': [meeting]}]
                })

            spinner.succeed('[ENG] Reading Session Detail - ' + course_name + ' - ' + bcolors.OKBLUE + 'Progress {} of {}'.format(
                index + 1, len(all_courses)) + bcolors.ENDC)

    db.insert_many(col_name, course_table)
    spinner.stop()


def get_enginneering_exception_dict() -> dict:
    excep = {
        "Humanities and Social Science elective.": ""
    }
    return excep

if __name__ == '__main__':
    dir_path = os.path.dirname(os.path.realpath(__file__))
    with open(f"{dir_path}/../../secrets.json") as f:
        data = json.load(f)
    db = CourseDB(data['dbname'], data['dbuser'], data['dbpwd'], useAuth=False)
    url = 'https://engineering.calendar.utoronto.ca/search-courses?course_keyword=&field_section_value=All&field_subject_area_target_id=All&page=$page'
    courseUrl = "https://engineering.calendar.utoronto.ca/course/$course"
    excep = get_enginneering_exception_dict()
    download_engineering_course_description(url, db, 'test', exceptionKeys=excep, startIndex=0, courseUrl=courseUrl)