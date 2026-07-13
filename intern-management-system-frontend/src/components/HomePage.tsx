import {Team} from "../models/Team";
import {Intern} from "../models/Intern";
import DashboardComponent from "./DashboardComponent"
import {  useEffect, useState } from "react";
import TeamService from "../services/TeamService";
import InternService from "../services/InternService";
import useRefreshToken from "../utils/useRefreshToken";
import { useFetcher } from "react-router-dom";
import useAxiosPrivate from "../utils/useAxiosPrivate";
import Loading from "./Loading";
import { Badge, Calendar, Card, Divider, List, Space, Statistic, message } from "antd";
import { NoticeType } from "antd/es/message/interface";
import TeamTable from "./tables/TeamTable";
import ApplicationService from "../services/ApplicationsService";
import dayjs, { Dayjs } from "dayjs";
import LocaleDetector from "./LocalDetecor";
import { SpecialDay } from "../models/SpecialDay";
import type { CellRenderInfo } from 'rc-picker/lib/interface';
import AttendanceService from "../services/AttendanceService";
import useAuth from "../utils/useAuth";


 
function HomePage() {

    const axiosPrivate = useAxiosPrivate();
        const [interns, setInterns] = useState<Intern []>();
    const [teams, setTeams] = useState<Team []>();
    const [applications, setApplications] = useState<Intern []>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notifications, setNotifications] = useState<string []>();
    const [specialDays, setSpecialDays] = useState<SpecialDay []>();
    const [importantDays, setImportantDays] = useState<SpecialDay []>([]);
    const browserLocale = navigator.language.toLowerCase();
    
    // GET ALL DATA FROM DATABASE
    const getData = async () => {
        try {
        const internData = await InternService.getInterns(axiosPrivate);
        setInterns(internData);

        const teamData = await TeamService.getTeams(axiosPrivate);
        setTeams(teamData);

        const applicationData = await ApplicationService.getApplications(axiosPrivate);
        setApplications(applicationData);

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

        } catch (error: any) {
            if (!error?.response) {
                giveMessage("error", "No server response");
              }  else {
                giveMessage("error", "Error while fetchind data");
              }
        
        }
    };
    
    useEffect(() => {
        getData();
    }, []);

    
    useEffect(() => {
      if(teams && interns && applications) {
        getNotifications();
        fetchImportantDays();
        setIsLoading(false);
      }
    }, [teams, interns, applications])

    const fetchImportantDays = () => {
        interns?.map(intern => {
            const birthday: SpecialDay = {
                date: intern.birthday,
                title: `${intern.first_name + " " + intern.last_name}'s birthday 🎂`
            }

            const internshipStart = {
                date: intern.internship_starting_date,
                title: `${intern.first_name + " " + intern.last_name}'s first day 🚀`
            }

            const internshipEnd = {
                date: intern.internship_ending_date,
                title: `${intern.first_name + " " + intern.last_name}'s last day 🏁`
            }

            importantDays?.push(birthday);
            importantDays?.push(internshipStart);
            importantDays?.push(internshipEnd);
        })
    }

   

    const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
    };


    const getNotifications = () => {
        const newNotifications: string [] = [];

        const numberOfWaitingApplications = applications?.filter(application => application.application_status === "waiting").length;
        if(numberOfWaitingApplications) {
            const newNotification = `You have ${numberOfWaitingApplications} waiting application(s)`;
            newNotifications.push(newNotification);
        }

        const endingInternships = interns?.filter(intern =>
            intern.internship_ending_date - dayjs().unix() <= 60 * 60 * 24 * 7 //if the internship is going to end in 3 days
            );

    
        if(endingInternships) {
            endingInternships.map(endingInternship => {
                const name = endingInternship.first_name + " " + endingInternship.last_name;
                const endingDay = dayjs(endingInternship.internship_ending_date * 1000)
                const today = dayjs().startOf("day");
                const tomorrow = dayjs().add(1, "day").startOf("day");

                let dayText = "";
                if (endingDay.isSame(today, "day")) {
                    dayText = "today";
                } else if (endingDay.isSame(tomorrow, "day")) {
                    dayText = "tomorrow";
                } else {
                    dayText = endingDay.format("dddd");
                }

                const newNotification = `${name}'s internship will end on ${dayText} `
                newNotifications.push(newNotification);
            })
        }

        setNotifications(newNotifications);   
    }


    const cellRender = (current: Dayjs, info: CellRenderInfo<Dayjs>) => {
        if (info.type === 'date') return dateCellRender(current);
        return info.originNode;
    }

    const dateCellRender = (value: Dayjs) => {

        const badges: JSX.Element[] = [];

        const currentSpecialDays: SpecialDay [] | undefined = specialDays?.filter(specialDay => {
            return specialDay.date === value.startOf("day").unix();
        })

        //print special days like public holidays
        if(currentSpecialDays) {
            currentSpecialDays.map(specialDay => {
                return badges.push(<Badge status="default" text={specialDay.title} />);
            })
        }

        //print birthdays, intern starting and ending days
        const currentImportantDays: SpecialDay [] | undefined = importantDays.filter(importantDay => {
            if(importantDay.title.includes("birthday")){
                return dayjs(importantDay.date * 1000).month() === value.startOf("day").month() && dayjs(importantDay.date * 1000).date() === value.startOf("day").date();
            } else{
                return importantDay.date === value.startOf("day").unix();
            }
            
        })
        

        if(currentImportantDays) {
            currentImportantDays.map(importantDay => {
                badges.push(<Badge status="success" text={importantDay.title} />);
            }) 
        }

        return badges.length > 0 ? badges : null;
              };


    
    if(isLoading){
        return (
            <Loading />
        )
    }
    
return (
            <>

            <Divider orientation="left">
                <h2 style={{fontWeight: "normal", textAlign: "center", fontSize: "25px"}}>Teams</h2>
            </Divider>


            <Space size={[30, 32]} wrap style={{display: "flex", justifyContent: "center"}}>

                {teams?.map(team => {
                    const numberOfInterns = interns?.filter(intern => intern.team_id === team.team_id).length;
                    
                    return (
                        <Card title={<div style={{ textAlign: "center", fontSize: "20px" }}>{team.team_name}</div>} bordered={false} style={{ width: "400px", height: "240px"}} hoverable>
                        <Statistic title="Number of Interns" value={numberOfInterns} /><br />
                        <span style={{color: "gray"}}>Supervisors</span><br />
                        <span style={{fontSize: "20px"}}>{team.supervisors?.toString()}</span>
                        </Card>
                    )
                })}
            </Space>

            <br /><br />
            
            <Divider orientation="left">
                <h2 style={{fontWeight: "normal", textAlign: "center", fontSize: "25px"}}>Calendar</h2>
            </Divider>
            
            <div style={{display: "flex", justifyContent: "center"}}>
            <div style={{width: "85%", border: "2px solid #f0f0f0", borderRadius: "10px"}}>
            <LocaleDetector>
            <Calendar style={{margin: "15px"}}  cellRender={cellRender}/>
            </LocaleDetector>
            </div>
            </div>

            <br /><br /><br /><br /><br />
            </>
        );
    
}

export default HomePage;