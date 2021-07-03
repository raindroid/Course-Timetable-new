import urllib.request
from typing import List
import re, os, json
from courseDB import CourseDB
from bs4 import BeautifulSoup
from pprint import pprint
from utils import get_page, change_keys, parse_day
from utils import bcolors
from halo import Halo

"""
GREAT News
Starting this year, the engineering departments and art science departs use the same website formatting to display course information!
Not the same website, and both don't include meeting times

so I'll use the same funciton
"""
htmlEntitiesReplacement = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": "\"",
    "&apos;": "'",
    "&cent;": "¢",
    "&pound;": "£",
    "&yen;": "¥",
    "&euro;": "€",
    "&copy;": "©",
    "&reg;": "®",
}

def clearHtmlEntitiesChars(text):
    result = text
    for oldWord, newWord in htmlEntitiesReplacement.items():
        while oldWord in result:
            result = result.replace(oldWord, newWord)
    return result

def download_course_description_single_page(url: str, db: CourseDB, col_name: str, exceptionDic: dict, spinner=None, departmentHint:str="ENG", exceptionKeys:dict={}):
    page = get_page(url)

    soup = BeautifulSoup(page, 'html.parser')
    # testItem = 729
    course_desc_list = soup.find('div', {"class": "view-content"})
    if not course_desc_list:
        return 0
    course_desc_list = course_desc_list.findChildren("div" , recursive=False)

    if len(course_desc_list) == 0: 
        return 0
    else:
        if spinner: spinner.info(f'Total: {len(course_desc_list)} courses for link {url}')

    courseCode = 0
    for index, tag in enumerate(course_desc_list):
        # this is a course code section
        courseCode, courseTitle = tag.p.string.split(' - ')[:2]
        courseCode = courseCode.strip()
                
        courseDescription = ''
        if courseCode in exceptionDic:
            courseDescription = exceptionDic[courseCode]
        else:
            descTag = tag.find('div', {"class": "views-field-field-desc"})
            if descTag.getText():
                courseDescription += descTag.getText()
            courseDescription.strip()

        if len(courseDescription) < 2:
            spinner.stop_and_persist(f"No description found for course {courseCode}")
            assert False, f"No description found for course {courseCode}"

        if len(courseTitle) < 2:
            spinner.stop_and_persist(f"No title found for course {courseCode}")
            assert False, f"No title found for course {courseCode}"

        courseInfo = {
            "courseTitle": courseTitle.strip(),
            "courseDescription": courseDescription.strip(),
        }
        for infoTag in tag.find_all(['div', 'span', 'p', 'a'], {"class": "views-field"}):
            fieldTag = infoTag.find('strong')
            if not fieldTag: continue
            fieldName = fieldTag.getText().strip()
            fieldInfo = infoTag.getText().strip()
            if fieldName in fieldInfo: fieldInfo = fieldInfo.replace(fieldName, '').strip()
            if fieldInfo == courseDescription: continue
            courseInfo[fieldName] = fieldInfo

        cleanCourseInfo = {}
        for key, value in courseInfo.items():
            key = key.strip()
            value = value.strip()
            if len(key) > 0 and key[-1] == ':': key = key[:-1]
            if key in exceptionKeys.keys():   # handle exceptions
                key = exceptionKeys[key]
            if len(key) == 0: continue  # wrong format in html, ignore
            cleanCourseInfo[clearHtmlEntitiesChars(key)] = clearHtmlEntitiesChars(value)
        
        courseInfo = change_keys(cleanCourseInfo, {
            "Credit Value": 'courseCredit',
            "Hours": 'courseHours',
            "Prerequisite": 'coursePrerequisite',
            "Corequisite": 'courseCorequisite',
            "Recommended Preparation": 'courseRecommendedPreparation',
            "Total AUs": 'courseAUs',
            "Program Tags": 'courseProgramTags',
            'Exclusion': 'courseExclusion',
            "Distribution Requirements": 'courseDistributionRequirementsv',
            "Breadth Requirements": 'courseBreadthRequirements',
            "Previous Course Number": 'coursePreviousCourseNumber'
        })
        updateCount = (db.update_many(col_name, {'courseName': {'$regex': courseCode+'.*'}},
                      courseInfo)).modified_count
        if updateCount < 1:
            courseInfo['courseName'] = courseCode
            courseInfo['mettings'] = {}
            db.insert_one(col_name, courseInfo)
            updateCount = 1
            
        if spinner: spinner.succeed(f'[{departmentHint}]Updating course title and description - {courseCode}. Modified {updateCount} entries Progress {index + 1} of {len(course_desc_list)}')
    return len(course_desc_list)