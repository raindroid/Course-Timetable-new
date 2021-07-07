
const dbuser = `$dbuser`; // provided in secrets.json
const dbname = `$dbname`; // provided in secrets.json
const dbpwd = `$dbpwd`; // provided in secrets.json

use dbname;
db.info.insertOne({document: "UT", school: "University of Toronto (St. George)", sessions: {
    "2021_2022-FallWinter": {
        displayName: "2021/22 Fall&Winter",
        termCount: 2,
        termNames: ["fall", "winter"],
        termDetail: {
            fall: {beginDate: new Date(2021, 9, 9), endDate: new Date(2021, 12, 21), termId: 1}, 
            winter: {beginDate: new Date(2022, 1, 10), endDate: new Date(2022, 4, 29), termId: 2}, 
            year: {beginDate: new Date(2021, 9, 9), endDate: new Date(2022, 4,29), termId: 3}
        }
    }}})
db.createCollection("UT_2021_2022-FallWinter")
db.createUser({user: dbuser, pwd: dbpwd, roles: [{role: "readWrite", db: dbname}]});

db.timetableSaved.insertOne({
    session: "2021_2022-FallWinter",
    school: "UT",
    tId: "1234",
    timetable: "[]"
})