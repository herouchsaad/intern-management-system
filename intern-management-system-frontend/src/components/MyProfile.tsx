import { useEffect, useState } from "react";
import { Intern } from "../models/Intern";
import { Team } from "../models/Team";
import useAxiosPrivate from "../utils/useAxiosPrivate";
import TeamService from "../services/TeamService";
import { SpecialDay } from "../models/SpecialDay";
import dayjs from "dayjs";
import AttendanceService from "../services/AttendanceService";
import { NoticeType } from "antd/es/message/interface";
import { message } from "antd";
import Loading from "./Loading";
import InternService from "../services/InternService";
import useAuth from "../utils/useAuth";
import CVComponent from "./CVComponent";
import AssignmentService from "../services/AssignmentService";
import { Assignment } from "../models/Assignment";
import { Attendance } from "../models/Attendance";


const MyProfile = () => {

    const [intern, setIntern] = useState<Intern>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [teams, setTeams] = useState<Team []>();
    const [specialDays, setSpecialDays] = useState<SpecialDay []>();
    const [assignments, setAssignments] = useState<Assignment []>();
    const [attendance, setAttendance] = useState<Attendance []>();
    const axiosPrivate = useAxiosPrivate();
    const browserLocale = navigator.language.toLowerCase();
    const { auth }: any = useAuth();

    // GET ALL DATA FROM DATABASE
    const getData = async () => {
        try {
            
            const internData = await InternService.getIntern(axiosPrivate, auth.username)
            setIntern(internData);
            
            const teamData = await TeamService.getTeams(axiosPrivate);
            setTeams(teamData);

            const assignmentsData = await AssignmentService.getAssignmentsForIntern(axiosPrivate, internData?.intern_id!);
            setAssignments(assignmentsData);

            const attendancesData = await AttendanceService.getAttendances(axiosPrivate, internData.intern_id!)
            setAttendance(attendancesData);
    
            var local: string;
            var holidayCheck: string;
            if(browserLocale.startsWith("tr")){
                local = "tr.turkish";
                holidayCheck = "Resmi tatil"
            } else{
                local = "en.usa";
                holidayCheck = "Public holiday"
            }
            const specialDaysData = await AttendanceService.getSpecialDays(local);
            const specialDaysArray = specialDaysData.items;
    
            const newSpecialDays: SpecialDay [] = [] 
            specialDaysArray.map((specialDay: any) => {
                if(specialDay.description === holidayCheck) {
                const title =  specialDay.summary;
                const date = dayjs(specialDay.start.date).unix();
    
                const newSpecialDay: SpecialDay = {
                    title: title,
                    date: date,
                };
    
                newSpecialDays.push(newSpecialDay);
                }
            })
    
            setSpecialDays(newSpecialDays);
    
            } 
        catch (error: any) {
console.log(error);
            if (!error?.response) {
                giveMessage("error", "No server response");
            }  else {
                giveMessage("error", "Error while fetchind data");
            }
            }
          
    };


    useEffect(() => {
        getData();
    }, [])

    useEffect(() => {
        if(specialDays && teams && intern) {
            setIsLoading(false);
        }
    }, [specialDays, teams, intern])


    const refetchData = async () => {
        try {
            const assignmentsData = await AssignmentService.getAssignmentsForIntern(axiosPrivate, intern?.intern_id!);
            setAssignments(assignmentsData);
    
            } 
        catch (error: any) {
console.log(error);
                if (!error?.response) {
                    giveMessage("error", "No server response");
                }  else {
                    giveMessage("error", "Error while fetchind data");
                }
            }  
    };

    const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
    };

    if(isLoading) {
        return <Loading />
    }

    return (
        <>
        <h2>My Profile</h2>

        <CVComponent intern={intern!} teams={teams!} assignments={assignments} attendances={attendance} specialDays={specialDays!} refetchData={refetchData}  />
        </>
      );
}
 
export default MyProfile;