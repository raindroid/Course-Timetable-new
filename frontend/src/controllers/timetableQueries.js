import { gql } from "@apollo/client";

const saveTimetableQuery = gql`
  mutation Timetable($timetable: String!) {
    saveTimetable(timetable: $timetable)
  }
`;

const getTimetableQuery = gql`
  query Timetable($id: String!) {
    getTimetable(id: $id)
  }
`;
