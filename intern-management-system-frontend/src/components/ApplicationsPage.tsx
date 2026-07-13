import { useEffect, useState } from "react";
import { Intern } from "../models/Intern";
import { Team } from "../models/Team";
import useAxiosPrivate from "../utils/useAxiosPrivate";
import InternApplicationsTable from "./tables/InternApplicationsTable";
import ApplicationService from "../services/ApplicationsService";
import Loading from "./Loading";
import TeamService from "../services/TeamService";
import { NoticeType } from "antd/es/message/interface";
import { Button, Popconfirm, Tabs, message } from "antd";
import TabPane from "antd/es/tabs/TabPane";

const Applications = () => {

    const axiosPrivate = useAxiosPrivate();
    const [applications, setApplications] = useState<Intern []>();
    const [isLoading, setIsLoading] = useState(true);
    const [teams, setTeams] = useState<Team []>();

     // GET ALL DATA FROM DATABASE
     const getData = async () => {
      try {
        
        const applicationsData = await ApplicationService.getApplications(axiosPrivate);
        setApplications(applicationsData);

        const teamsData = await TeamService.getTeams(axiosPrivate);
        setTeams(teamsData);

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
    };
    
    useEffect(() => {
        if(isLoading){
            getData();
        }
    }, [isLoading]);

    useEffect(() => {
        if(applications && teams) {
          setIsLoading(false);
        }
      }, [applications, teams])



    const refetchData = async () => {
      try {
        const applicationsData = await ApplicationService.getApplications(axiosPrivate);
        setApplications(applicationsData);

        const teamsData = await TeamService.getTeams(axiosPrivate);
        setTeams(teamsData);

      } catch (error: any) {
        console.log(error);
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

    const emptyArchieve = async ()  => {
      try {
        await ApplicationService.emptyArchieve(axiosPrivate);
        
        giveMessage("success", "Archieve emptied");
      } catch (error: any) {
console.log(error);
        if (!error?.response) {
          giveMessage("error", "No server response");
        } 
            else {
          giveMessage("error", "Error while emptying archieve!");
        }
      } finally {
          refetchData();
      }
    }


    return (
      <>
        {isLoading ? <Loading /> :
        <>

        <br />

        <div className='applications-table'>
            <Tabs defaultActiveKey='1' size='middle' tabBarExtraContent={
              <Popconfirm
              title="Empty Archieve"
              description={
              <>
              <span>Are you sure to delete all archieved applications?</span><br />
              <span style={{fontWeight: "bold"}}>Warning!</span><span> Current working interns could not be deleted.</span>
              </>
            }
              onConfirm={emptyArchieve}
              okText="Yes"
              cancelText="No"
              >
              <Button type='primary' danger>Emtyp Archieve</Button>
              </Popconfirm>
            }>
                <TabPane tab="Waiting" key="1">
                  <InternApplicationsTable applications={applications!.filter(application => application.application_status === "waiting")} refetchData={refetchData} teams={teams!}/>
                </TabPane>
                <TabPane tab="Archive" key="2" >
                  <InternApplicationsTable applications={applications!.filter(application => application.application_status === "accepted" || application.application_status === "rejected" )} refetchData={refetchData} teams={teams!}/>
                </TabPane>
            </Tabs>
        </div>
        
        </>}
      </>
      );
}
 
export default Applications;