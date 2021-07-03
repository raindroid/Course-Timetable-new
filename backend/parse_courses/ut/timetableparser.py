import urllib.request
from typing import List
import re
from courseDB import CourseDB
from bs4 import BeautifulSoup
from pprint import pprint, pformat
import json
from eng_course_finder import *
from artsci_course_finder import *
from utils import bcolors
import time, os
from datetime import datetime

def updateDB(db: CourseDB, collectionName: str):
    startTime = time.time()

    print('Start downloading course information StartTime:{}'.format(time.asctime( time.localtime(time.time()) )))
    # update engineering course to the mongodb fall term and year courses
    download_engineering_table("https://portal.engineering.utoronto.ca/sites/timetable/fall.html", db, collectionName,
                               save_year_course=True)
    # update engineering course to the mongodb winter term
    download_engineering_table("https://portal.engineering.utoronto.ca/sites/timetable/winter.html", db, collectionName,
                               save_year_course=False, drop_first=False)

    # update engineering course detail
    excep = get_enginneering_exception_dict()
    download_engineering_course_description(
        'https://engineering.calendar.utoronto.ca/search-courses?course_keyword=&field_section_value=All&field_subject_area_target_id=All&page=$page', db, collectionName, exceptionKeys=excep, startIndex=0)

    # update artsci course to the mongodb
    download_artsci_table(db, collectionName, drop_first=False, time="20219")

    # update artsci course detail
    excep = get_artsci_exception_dict()
    download_artsci_course_description(
        'https://artsci.calendar.utoronto.ca/search-courses?course_keyword=&field_section_value=All&field_prerequisite_value=&field_breadth_requirements_value=All&field_distribution_requirements_value=All&page=$page', 
        db, collectionName, exceptionKeys=excep, startIndex=0)

    print(bcolors.OKGREEN + 'All download DONE!' + bcolors.ENDC)

    endTime = time.time()
    elapsed = endTime - startTime
    print('EndTime:{}\nTime Spend:{:.4f}s'.format(time.asctime( time.localtime(time.time()) ), elapsed))

def updateTime(db: CourseDB):
    db.getCol('update').update_one({'time': {'$regex': '.*'}}, {'$set': {'time': datetime.utcnow().isoformat()}}, upsert = True)

if __name__ == '__main__':
    
    dir_path = os.path.dirname(os.path.realpath(__file__))
    with open(f"{dir_path}/../../secrets.json") as f:
        data = json.load(f)
    db = CourseDB(data['dbname'], data['dbuser'], data['dbpwd'], useAuth=False)
    try:
        updateDB(db, 'UT_2021_2022-FallWinter')
    except Exception as e: 
        print(e)

    updateTime(db)