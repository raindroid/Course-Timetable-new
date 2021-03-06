import pymongo
from typing import List
import json
import os

class CourseDB():

    def __init__(self, db_name: str, dbuser: str="", dbpasswd: str="", useAuth: bool=True):
        db_client = f"mongodb://{dbuser}:{dbpasswd}@localhost:27017/" if useAuth else "mongodb://localhost:27017/"
        self.__db_name = db_name
        self.__db_client = pymongo.MongoClient(db_client)
        self.__mydb = self.__db_client[self.__db_name]

    def show_dbs(self) -> List[str]:
        return self.__db_client.list_database_names()

    def open_col(self, col_name: str):
        return self.__mydb[col_name]

    def insert_one(self, col_name: str, data: dict):
        self.__mydb[col_name].insert_one(data)

    def insert_many(self, col_name: str, data: List[dict]):
        self.__mydb[col_name].insert_many(data)

    def insert_oneList(self, col_name: str, header: List[str], info: List):
        data = {header[i]:info[i] for i in range(len(header))}
        self.__mydb[col_name].insert_one(data)

    def insert_manyList(self, col_name: str, header: List[str], info: List[List]):
        for d in info:
            data = {header[i]: d[i] for i in range(len(header))}
            self.__mydb[col_name].insert_one(data)

    def drop_col(self, col_name: str):
        self.__mydb[col_name].drop()

    def find_col(self, col_name: str, data: dict):
        return self.__mydb[col_name].find(data)

    def update_many(self, col_name: str, query: dict, newData: dict):
        return self.__mydb[col_name].update_many(query, {'$set': newData})
    
    def getCol(self, col_name: str):
        return self.__mydb[col_name]


if __name__=='__main__':

    dir_path = os.path.dirname(os.path.realpath(__file__))
    with open(f"{dir_path}/../../secrets.json") as f:
        data = json.load(f)
    db = CourseDB(data['dbname'], data['dbuser'], data['dbpwd'], useAuth=False)
    db.insert_one('UT_2021_2022-FallWinter', {'name': 'APS'})