import {Form, Select, Row, Col, message} from "antd";
import {useEffect, useState} from "react";
import "../styles.css";
import {Intern} from "../models/Intern";
import {Team} from "../models/Team";
import CVComponent from "./CVComponent"
import InternService from "../services/InternService";
import TeamService from "../services/TeamService";
import useAxiosPrivate from "../utils/useAxiosPrivate";
import Loading from "./Loading";
import { Assignment } from "../models/Assignment";
import AssignmentService from "../services/AssignmentService";
import { NoticeType } from "antd/es/message/interface";
import { Attendance } from "../models/Attendance";
import AttendanceService from "../services/AttendanceService";
import { SpecialDay } from "../models/SpecialDay";
import dayjs from "dayjs";
import useAuth from "../utils/useAuth";
import { Document } from "../models/Document";


const InternsPage = () => {

    const [team, setTeam] = useState<Team>();
    const [interns, setInterns] = useState<Intern []>();
    const [teams, setTeams] = useState<Team []>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isReloading, setIsReloading] = useState<boolean>(false);
    const axiosPrivate = useAxiosPrivate();
    const [assignments, setAssignments] = useState<Assignment []>();
    const [attendance, setAttendance] = useState<Attendance []>();
    const [selectDisabled, setSelectDisabled] = useState<boolean>(true);
    const [selectedIntern, setSelectedIntern] = useState<Intern>();
    const [specialDays, setSpecialDays] = useState<SpecialDay []>();
    const [documents, setDocuments] = useState<Document []>();
    const [form] = Form.useForm();
    const {auth}: any = useAuth();
    let counter = -1;

    const browserLocale = navigator.language.toLowerCase();

    
    // GET ALL DATA FROM DATABASE
    const getData = async () => {
      try {
        const internData = await InternService.getInterns(axiosPrivate);
        setInterns(internData);

        const teamData = await TeamService.getTeams(axiosPrivate);
        setTeams(teamData);

        

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

    //add another function: refetchData, without setting null to interns and teams, only update them and update the selected user
    const refetchData = async () => {
      try {
        const internData = await InternService.getInterns(axiosPrivate);
        setInterns(internData);

        const teamData = await TeamService.getTeams(axiosPrivate);
        setTeams(teamData);

        if(selectedIntern) { //If a data in the selected user updated, we have to update the intern variable from new interns array
          const intern_id = selectedIntern.intern_id;   

          const updatedIntern = internData?.filter(intern => intern.intern_id === intern_id)[0]
          setSelectedIntern(updatedIntern);
        }
        
      }
        catch (error: any) {
        if (!error?.response) {
          giveMessage("error", "No server response");
        }  
            else {
          giveMessage("error", "Error while fetchind data");
        }
      }
    }

    useEffect(() => {
      getData()
    }, [])
    

        useEffect(() => {
      if(teams && interns && specialDays) {
                setIsLoading(false);
      }
    }, [teams, interns, specialDays])
    

  
  const handleTeamSelect = (e: any) => {
    setTeam(teams![e]);
    setSelectedIntern(undefined);
    handleUpdateValue();
    setSelectDisabled(false);
    
    counter = -1;
  }


  const renderCv = (e: any) => {

    let teamInterns: Intern[] = []
    
    //Find the selected intern
    for(let i = 0; i < interns!.length; i++){
      if(teams!.filter(team => team.team_id === interns![i].team_id)[0].team_name === team!.team_name){
        teamInterns.push(interns![i]);
      }
    }

    setSelectedIntern(teamInterns[e]);
  }


 
  const handleUpdateValue = () => {
    form.setFieldsValue({
      internSelectItem: "Select an intern",
    });
  };

  useEffect(() => {
    if(selectedIntern) {
      getAssignments();
      getAttendances();
      getDocuments();
    }
  }, [selectedIntern]);


  const getAssignments = async () => {
    try {
      const assignmentsData = await AssignmentService.getAssignmentsForIntern(axiosPrivate, selectedIntern?.intern_id!);
      setAssignments(assignmentsData);
    }
        catch (error: any) {
console.log(error);
        if (!error?.response) {
          giveMessage("error", "No server response");
        }  
            else {
          giveMessage("error", "Error while fetchind data");
        }
    }
      }

  const getAttendances = async () => {
    try {
      const attendancesData = await AttendanceService.getAttendances(axiosPrivate, selectedIntern?.intern_id!)
      setAttendance(attendancesData);

    } catch (error: any) {
console.log(error);
        if (!error?.response) {
          giveMessage("error", "No server response");
        }  else {
          giveMessage("error", "Error while fetchind data");
        }
    }
    
  }

  const getDocuments = async () => {
    try {
      if(auth.role === 5150 && selectedIntern) {
        const documentsData = await InternService.getDocuments(axiosPrivate, selectedIntern.intern_id!);
        setDocuments(documentsData);
      }
    } 
        catch (error: any) {
      if (!error?.response) {
        giveMessage("error", "No server response");
      }
            else {
        giveMessage("error", "Error while fetchind data");
      }
    }
  }

  const giveMessage = (type: NoticeType, mssge: string) => {
    message.open({
      type: type,
      content: mssge,
    });
  };


    if(isLoading){
        return <Loading />
    }

    return (
      <>
      
      <br />

      <div className="intern-page-selections" style={{display: "flex"}}>
      <Form layout="vertical" form={form}>
          <Row gutter={100}>
            <Col span={12}>
              <Form.Item label="Team" name="teamSelectItem" style={{width: 350}}>
                <Select onChange={handleTeamSelect}
                showSearch
                optionFilterProp="children"
                placeholder="Select a team" >
                    {teams!.map((team,index) => {
                                            if(auth.role === 1984) {
                        return (
                          team.team_id === auth.team_id && <Select.Option key={index} value={index}>{team.team_name}</Select.Option>
                        )
                      } else {
                        return (
                          <Select.Option key={index} value={index}>{team.team_name}</Select.Option>
                        )
                      }
                      
                      
                      
                    })}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Intern" name="internSelectItem" style={{width: 350, marginLeft: "auto"}}>
                
                <Select  
                disabled={selectDisabled}
                onChange={renderCv}
                className="internSelect"
                showSearch
                optionFilterProp="children"
                >
                
                  {team && interns!.map((intern, index) => {
                      if(teams!.filter(team => team.team_id === intern.team_id)[0].team_name === team!.team_name){
                        counter++;
                        return (
                          <Select.Option key={index} value={counter}>{intern.first_name + " " + intern.last_name}</Select.Option>
                        )
                      }
                      
                    })}
                </Select>
              </Form.Item>
            </Col>

          </Row>
        </Form>
        
      </div>
      <br />
      
          <div className="cv-area">
        {selectedIntern && <CVComponent documents={documents} specialDays={specialDays!} getAttendances={getAttendances} setIntern={setSelectedIntern} getAssignments={getAssignments} attendances={attendance} assignments={assignments} intern={selectedIntern} teams={teams!} interns={interns!} refetchData={refetchData} />}
      </div>

      <br /><br /><br />
      </> 
      );
}
 
export default InternsPage;