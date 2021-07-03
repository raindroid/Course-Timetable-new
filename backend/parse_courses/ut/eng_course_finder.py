import urllib.request
from typing import List
import re, os, json
from courseDB import CourseDB
from bs4 import BeautifulSoup
from pprint import pprint
from utils import get_page, change_keys, parse_day
from utils import bcolors
from halo import Halo

def download_engineering_course_description_single_page(url: str, db: CourseDB, col_name: str, exceptionDic: dict, spinner=None):
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

    courseCode = 0  # give this variable more scope
    courseInfo = {}
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
            if len(key) == 0: continue  # wrong format in html, ignore
            if key[-1] == ':': key = key[:-1]
            if key == 'Humanities and Social Science elective.': continue  # wrong format in html, exceptions only for ESC203H1
            cleanCourseInfo[clearHtmlEntitiesChars(key)] = clearHtmlEntitiesChars(value)
        
        courseInfo = change_keys(cleanCourseInfo, {
            "Credit Value": 'courseCredit',
            "Hours": 'courseHours',
            "Prerequisite": 'coursePrerequisite',
            "Corequisite": 'courseCorequisite',
            "Recommended Preparation": 'courseRecommendedPreparation',
            "Total AUs": 'courseAUs',
            "Program Tags": 'courseProgramTags',
            'Exclusion': 'courseExclusion'
        })
        updateCount = (db.update_many(col_name, {'courseName': {'$regex': courseCode+'.*'}},
                      courseInfo)).modified_count
        if updateCount < 1:
            courseInfo['courseName'] = courseCode
            courseInfo['mettings'] = {}
            db.insert_one(col_name, courseInfo)
            updateCount = 1
            
        if spinner: spinner.succeed(f'[ENG]Updating course title and description - {courseCode}. Modified {updateCount} entries Progress {index + 1} of {len(course_desc_list)}')
    return len(course_desc_list)

def download_engineering_course_description(url: str, db: CourseDB, col_name: str, exceptionDic: dict={}, startIndex=0):
    spinner = Halo(text='Downloading UTSG Engineering Course Description')
    spinner.start()

    count = 0
    if not '$page' in url:
        count = download_engineering_course_description_single_page(url, db, col_name, exceptionDic, spinner=spinner)
    else:
        page_index = startIndex
        size = download_engineering_course_description_single_page(url.replace("$page", str(page_index)), db, col_name, exceptionDic, spinner=spinner)
        total_size = size
        while size > 0:
            size = download_engineering_course_description_single_page(url.replace("$page", str(page_index)), db, col_name, exceptionDic, spinner=spinner)
            total_size += size
            page_index += 1
        count = size
    spinner.stop()
    return count

def download_engineering_table(url: str, db: CourseDB, col_name: str, save_year_course: bool = True, drop_frist: bool = True) -> str:
    spinner = Halo(text='Downloading UTSG Engineering Course Timetable')
    spinner.start()
    page = get_page(url)

    soup = BeautifulSoup(page, 'html.parser')
    course_groups_html = soup.find_all('table')[1:]

    course_table = []
    if drop_frist:
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
            detail_info.update({'meetingDay': parse_day(detail_info['meetingDay'])})
            instructor = detail_info['instructor']
            meeting = {'meetingName': meeting_info[1],
                       'meetingType': meeting_info[1][:3],
                       'instructors': [] if instructor == 'NONE' else [instructor],
                       'detail': [detail_info]}
            meeting_type = meeting.pop('meetingType')

            # check for previous course name
            for previous_course in course_table:
                if previous_course['courseName'] == meeting_info[0]:

                    # check for previous meeting type first
                    meeting_type_found = False
                    for (previous_meeting_type, meetings) in previous_course['meetings'].items():
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
                        previous_course['meetings'].update({meeting_type: [meeting]})

                    course_found = True
                    break

            if not course_found:
                # add a new course
                course_table.append({
                    'courseName': course_name,
                    'courseType': course_type,
                    'meetings': {meeting_type: [meeting]}
                })

            spinner.succeed('[ENG] Reading Session Detail - ' + course_name + ' - ' + bcolors.OKBLUE + 'Progress {} of {}'.format(
                index + 1, len(all_courses)) + bcolors.ENDC)

    db.insert_many(col_name, course_table)
    spinner.stop()


def get_enginneering_exception_dict() -> dict:
    excep = {
        'APS111H1': 'This course introduces and provides a framework for the design process. Students are introduced to communication as an integral component of engineering practice. The course is a vehicle for understanding problem solving and developing communications skills. This first course in the two Engineering Strategies and Practice course sequence introduces students to the process of engineering design, to strategies for successful team work, and to design for human factors, society and the environment. Students write team and individual technical reports and give presentations within a discussion group.',
        'MIE368H1': 'This course showcases the impact of analytics focusing on real world examples and case studies.  Particular focus on decision analytics, where data and models are combined to ultimately improve decision-making.  Methods include: linear and logistic regression, classification and regression trees, clustering, linear and integer optimization. Application areas include: healthcare, business, sports, manufacturing, finance, transportation, public sector.',
        'CHE230H1': 'The chemical phenomena occurring in environmental systems are examined based on fundamental principles of organic, inorganic and physical chemistry. The course is divided into sections describing the chemistry of the atmosphere, natural waters and soils. The principles applied in the course include reaction kinetics and mechanisms, complex formation, pH and solubility equilibria and adsorption phenomena. Molecules of biochemical importance and instrumental methods of analysis relevant to environmental systems are also addressed. (formerly EDC230H1S)',
        'CHE249H1': 'Engineering analysis and design are not ends in themselves, but they are a means for satisfying human wants.  Thus, engineering concerns itself with the materials used and forces and laws of nature, and the needs of people.  Because of scarcity of resources and constraints at all levels, engineering must be closely associated with economics.  It is essential that engineering proposals be evaluated in terms of worth and cost before they are undertaken.  In this course we emphasize that an essential prerequisite of a successful engineering application is economic feasibility.  Hence, investment proposals are evaluated in terms of economic cost concepts, including break even analysis, cost estimation and time value of money.   Effective interest rates, inflation and deflation, depreciation and income tax all affect the viability of an investment. Successful engineering projects are chosen from valid alternatives considering such issues as buy or lease, make or buy, cost and benefits and financing alternatives.  Both public sector and for-profit examples are used to illustrate the applicability of these rules and approaches.',
        'CHE332H1': 'The rates of chemical processes. Topics include: measurement of reaction rates, reaction orders and activation energies; theories of reaction rates; reaction mechanisms and networks; development of the rate law for simple and complex kinetic schemes; approach to equilibrium; homogeneous and heterogeneous catalysis. Performance of simple chemical reactor types.',
        'CHE333H1': 'Covers the basics of simple reactor design and performance, with emphasis on unifying the concepts in kinetics, thermodynamics and transport phenomena. Topics include flow and residence time distributions in various reactor types as well as the influence of transport properties (bulk and interphase) on kinetics and reactor performance. The interplay of these facets of reaction engineering is illustrated by use of appropriate computer simulations.',
        'CHE412H1': 'Heterogeneous reactors. Mass and heat transport effects including intraparticle transport effects (Thiele modulus). Stability for various rate laws, transport regimes. Time dependent issues - deactivation/regeneration strategies. Emerging processes.',
        'CHE460H1': 'Review of the nature, properties and elementary toxicology of metallic and organic contaminants. Partitioning between environmental media (air, aerosols, water, particulate matter, soils, sediments and biota) including bioaccumulation. Degradation processes, multimedia transport and mass balance models. Regulatory approaches for assessing possible effects on human health and ecosystems.',
        'CHE470H1': 'A course covering selected topics in Chemical Engineering, not covered in other electives. Different topics may be covered each year depending on the interest of the Staff and students. May not be offered every year. Limited enrolment: permission of the Department required.',
        'CHE565H1': 'Application of aqueous chemical processing to mineral, environmental and industrial engineering. The course involves an introduction to the theory of electrolyte solutions, mineral-water interfaces, dissolution and crystallization processes, metal ion separations, and electrochemical processes in aqueous reactive systems. Applications and practice of (1) metal recovery from primary (i.e. ores) and secondary (i.e. recycled) sources by hydrometallurgical means, (2) treatment of aqueous waste streams for environmental protection, and (3) production of high-value-added inorganic materials.',
        'CHE568H1': 'Fundamental and applied aspects of nuclear engineering. The structure of the nucleus; nuclear stability and radioactive decay; the interaction of radiation with matter including radiological health hazards; the interaction of neutrons including cross-sections, flux, moderation, fission, neutron diffusion and criticality. Poison buildup and their effects on criticality. Nuclear engineering of reactors, reactor accidents, and safety issues. ',
        'MIE222H1': 'Design of mechanical joints. Elasto-plastic torsion of circular sections. Elasto-plastic bending of beams. Residual stresses, shearing stresses in beams, analysis of plane stress and plant strain problems. Pressure vessels, design of members of strength criteria, deflection of beams. Statistically indeterminate problems.',

    }
    return excep

if __name__ == '__main__':
    dir_path = os.path.dirname(os.path.realpath(__file__))
    with open(f"{dir_path}/../../secrets.json") as f:
        data = json.load(f)
    db = CourseDB(data['dbname'], data['dbuser'], data['dbpwd'], useAuth=False)
    url = 'https://engineering.calendar.utoronto.ca/search-courses?course_keyword=&field_section_value=All&field_subject_area_target_id=All&page=$page'
    excep = get_enginneering_exception_dict()
    download_engineering_course_description(url, db, 'test', exceptionDic={}, startIndex=0)